from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SnowflakeData
from .serializers import SnowflakeDataSerializer
import snowflake.connector
from django.conf import settings
import os
from dotenv import load_dotenv
from rest_framework import status

# Load environment variables
load_dotenv()

# Create your views here.

class SnowflakeDataViewSet(viewsets.ModelViewSet):
    queryset = SnowflakeData.objects.all()
    serializer_class = SnowflakeDataSerializer

    def execute_snowflake_query(self, query, params=None):
        """Helper method to execute Snowflake queries"""
        try:
            conn = snowflake.connector.connect(
                account=os.getenv('SNOWFLAKE_ACCOUNT'),
                user=os.getenv('SNOWFLAKE_USER'),
                password=os.getenv('SNOWFLAKE_PASSWORD'),
                warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
                database=os.getenv('SNOWFLAKE_DATABASE'),
                schema=os.getenv('SNOWFLAKE_SCHEMA')
            )
            
            cur = conn.cursor()
            cur.execute(query, params)
            results = cur.fetchall()
            column_names = [desc[0] for desc in cur.description] if cur.description else []
            
            formatted_results = [dict(zip(column_names, row)) for row in results]
            
            cur.close()
            conn.close()
            
            return {
                'success': True,
                'data': {
                    'columns': column_names,
                    'results': formatted_results,
                    'row_count': len(results)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @action(detail=False, methods=['get'])
    def get_customers(self, request):
        """Get list of customers from subs_dim_customer table"""
        query = """
        SELECT customer_key, customerfname, customerlname, customerphone
        FROM subs_dim_customer
        """
        result = self.execute_snowflake_query(query)
        if result['success']:
            return Response(result['data'])
        return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def customer_metrics(self, request):
        """Get all metrics for a specific customer"""
        customer_key = request.query_params.get('customer_key')
        if not customer_key:
            return Response({'error': 'customer_key is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Query 1: Favorite Sandwich
        favorite_sandwich_query = """
        WITH sandwich_counts AS (
            SELECT o.customer_key, p.productname, COUNT(*) AS sandwich_count
            FROM subs_fact_orderline o
                JOIN subs_dim_product p
                    ON o.product_key = p.product_key
            WHERE p.breadtype IS NOT NULL
            AND o.customer_key = %s
            GROUP BY o.customer_key, p.productname
        ),
        ranked_sandwiches AS (
            SELECT customer_key, productname AS sandwich, sandwich_count,
                ROW_NUMBER() OVER (PARTITION BY customer_key ORDER BY sandwich_count DESC) AS rn
            FROM sandwich_counts
        )
        SELECT customer_key, sandwich, sandwich_count
        FROM ranked_sandwiches
        WHERE rn = 1
        """

        # Query 2: Favorite Side
        favorite_side_query = """
        WITH side_counts AS (
            SELECT o.customer_key, p.productname, COUNT(*) as side_count
            FROM subs_fact_orderline o
                JOIN subs_dim_product p
                    ON o.product_key = p.product_key
            WHERE p.breadtype IS NULL
            AND o.customer_key = %s
            GROUP BY o.customer_key, p.productname
        ),
        ranked_sides AS (
            SELECT customer_key, productname AS side, side_count,
                ROW_NUMBER() OVER (PARTITION BY customer_key ORDER BY side_count DESC) as rn
            FROM side_counts
        )
        SELECT customer_key, side, side_count
        FROM ranked_sides
        WHERE rn = 1
        """

        # Query 3: Inches of Sandwich
        sandwich_inches_query = """
        SELECT o.customer_key, SUM(p.length) as inches_of_sandwich
        FROM subs_fact_orderline o
            JOIN subs_dim_product p
                ON o.product_key = p.product_key
        WHERE o.customer_key = %s
        GROUP BY o.customer_key
        HAVING SUM(p.length) > 0
        """

        # Query 4: Most Visited Store
        most_visited_store_query = """
        SELECT customer_key, city, MAX(times_visited) AS most_visited_count
        FROM (
            SELECT o.customer_key, o.store_key, s.city,
                COUNT(*) AS times_visited
            FROM subs_fact_orderline o
                JOIN subs_dim_store s
                    ON o.store_key = s.store_key
            WHERE o.customer_key = %s
            GROUP BY ALL
        ) AS customer_store_visits
        GROUP BY ALL
        """

        # Query 5: Favorite Month
        favorite_month_query = """
        WITH visits AS (
            SELECT o.customer_key, d.month, COUNT(*) AS numofvisits
            FROM subs_fact_orderline o
                JOIN subs_dim_date d
                    ON o.date_key = d.date_key
            WHERE o.customer_key = %s
            GROUP BY o.customer_key, d.month
        ),
        max_visits AS (
            SELECT customer_key,
                MAX(NumOfVisits) AS maxvisits
            FROM visits
            GROUP BY customer_key
        )
        SELECT v.customer_key, v.month, v.numofvisits
        FROM visits v
            JOIN max_visits m
                ON v.customer_key = m.customer_key
                AND v.numofvisits = m.maxvisits
        """

        # Execute all queries
        metrics = {}
        
        # Favorite Sandwich
        sandwich_result = self.execute_snowflake_query(favorite_sandwich_query, [customer_key])
        if sandwich_result['success']:
            metrics['favorite_sandwich'] = sandwich_result['data']['results'][0] if sandwich_result['data']['results'] else None

        # Favorite Side
        side_result = self.execute_snowflake_query(favorite_side_query, [customer_key])
        if side_result['success']:
            metrics['favorite_side'] = side_result['data']['results'][0] if side_result['data']['results'] else None

        # Sandwich Inches
        inches_result = self.execute_snowflake_query(sandwich_inches_query, [customer_key])
        if inches_result['success']:
            metrics['total_inches'] = inches_result['data']['results'][0] if inches_result['data']['results'] else None

        # Most Visited Store
        store_result = self.execute_snowflake_query(most_visited_store_query, [customer_key])
        if store_result['success']:
            metrics['most_visited_store'] = store_result['data']['results'][0] if store_result['data']['results'] else None

        # Favorite Month
        month_result = self.execute_snowflake_query(favorite_month_query, [customer_key])
        if month_result['success']:
            metrics['favorite_month'] = month_result['data']['results'][0] if month_result['data']['results'] else None

        return Response(metrics)

    @action(detail=False, methods=['get'])
    def fetch_from_snowflake(self, request):
        try:
            # Create Snowflake connection
            conn = snowflake.connector.connect(
                account=os.getenv('SNOWFLAKE_ACCOUNT'),
                user=os.getenv('SNOWFLAKE_USER'),
                password=os.getenv('SNOWFLAKE_PASSWORD'),
                warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
                database=os.getenv('SNOWFLAKE_DATABASE'),
                schema=os.getenv('SNOWFLAKE_SCHEMA')
            )

            # Create a cursor object
            cur = conn.cursor()

            # Execute a test query - this will show available tables in your schema
            cur.execute('SHOW TABLES')
            
            # Fetch all results
            results = cur.fetchall()

            # Close the cursor and connection
            cur.close()
            conn.close()

            return Response({
                'message': 'Connection successful',
                'tables': results
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def favorite_sandwiches(self, request):
        try:
            # Create Snowflake connection
            conn = snowflake.connector.connect(
                account=os.getenv('SNOWFLAKE_ACCOUNT'),
                user=os.getenv('SNOWFLAKE_USER'),
                password=os.getenv('SNOWFLAKE_PASSWORD'),
                warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
                database=os.getenv('SNOWFLAKE_DATABASE'),
                schema=os.getenv('SNOWFLAKE_SCHEMA')
            )

            # Create a cursor object
            cur = conn.cursor()

            # Execute the query to get favorite sandwiches
            cur.execute('''
            WITH sandwich_counts AS (
                SELECT o.customer_key, p.productname, COUNT(*) AS sandwich_count
                FROM subs_fact_orderline o
                    JOIN subs_dim_product p
                        ON o.product_key = p.product_key
                WHERE p.breadtype IS NOT NULL
                GROUP BY o.customer_key, p.productname
            ),
            ranked_sandwiches AS (
                SELECT customer_key, productname AS sandwich, sandwich_count,
                    ROW_NUMBER() OVER (PARTITION BY customer_key ORDER BY sandwich_count DESC) AS rn
                FROM sandwich_counts
            )
            SELECT customer_key, sandwich, sandwich_count
            FROM ranked_sandwiches
            WHERE rn = 1
            ORDER BY customer_key
            ''')
            
            # Fetch all results
            results = cur.fetchall()

            # Close the cursor and connection
            cur.close()
            conn.close()

            return Response({
                'message': 'Connection successful',
                'favorite_sandwiches': results
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def get_customer_by_phone(self, request):
        """Get customer details by phone number"""
        phone = request.query_params.get('phone')
        if not phone:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        query = """
        SELECT customer_key, customerfname, customerlname, customerphone
        FROM subs_dim_customer
        WHERE customerphone = %s
        """
        result = self.execute_snowflake_query(query, [phone])
        if result['success']:
            if not result['data']['results']:
                return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(result['data']['results'][0])
        return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
