import io
import os
import tempfile
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sales import Sales
from app.models.product import Product
from app.models.anomaly import Anomaly

class ReportGenerator:
    """PDF Reports generate करो"""
    
    @staticmethod
    def generate_sales_report(db: Session, start_date: datetime = None, end_date: datetime = None):
        """Sales Report - Last 30 days"""
        
        try:
            if not start_date:
                start_date = datetime.now() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now()
            
            # Data fetch करो
            sales_data = db.query(Sales).filter(
                Sales.sale_date >= start_date,
                Sales.sale_date <= end_date
            ).all()
            
            total_sales = len(sales_data)
            total_quantity = sum(s.quantity for s in sales_data) if sales_data else 0
            total_amount = sum(s.amount for s in sales_data) if sales_data else 0
            avg_transaction = total_amount / total_sales if total_sales > 0 else 0
            
            # PDF create करो
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            elements = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#667eea'),
                spaceAfter=30,
                alignment=1
            )
            
            # Title
            elements.append(Paragraph("📊 SALES REPORT", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Date Range
            date_text = f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
            elements.append(Paragraph(date_text, styles['Normal']))
            elements.append(Spacer(1, 0.3*inch))
            
            # Summary Stats
            stats_data = [
                ['Metric', 'Value'],
                ['Total Transactions', str(total_sales)],
                ['Total Quantity Sold', f"{total_quantity} units"],
                ['Total Revenue', f"₹{total_amount:,.2f}"],
                ['Avg Transaction Value', f"₹{avg_transaction:,.2f}"],
            ]
            
            stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
            stats_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(stats_table)
            elements.append(Spacer(1, 0.5*inch))
            
            # Daily breakdown
            elements.append(Paragraph("Daily Sales Breakdown", styles['Heading2']))
            elements.append(Spacer(1, 0.1*inch))
            
            daily_sales = {}
            for sale in sales_data:
                date = sale.sale_date.date()
                if date not in daily_sales:
                    daily_sales[date] = {'qty': 0, 'amount': 0, 'count': 0}
                daily_sales[date]['qty'] += sale.quantity
                daily_sales[date]['amount'] += sale.amount
                daily_sales[date]['count'] += 1
            
            daily_data = [['Date', 'Transactions', 'Quantity', 'Amount']]
            for date in sorted(daily_sales.keys()):
                daily_data.append([
                    date.strftime('%Y-%m-%d'),
                    str(daily_sales[date]['count']),
                    str(daily_sales[date]['qty']),
                    f"₹{daily_sales[date]['amount']:,.2f}"
                ])
            
            if len(daily_data) > 1:
                daily_table = Table(daily_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
                daily_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
                ]))
                elements.append(daily_table)
            
            elements.append(Spacer(1, 0.3*inch))
            
            # Footer
            elements.append(Spacer(1, 0.5*inch))
            footer_text = f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            elements.append(Paragraph(footer_text, ParagraphStyle('footer', parent=styles['Normal'], fontSize=10, textColor=colors.grey)))
            
            # Build PDF
            doc.build(elements)
            buffer.seek(0)
            
            return buffer.getvalue()
        
        except Exception as e:
            print(f"❌ Error in generate_sales_report: {e}")
            raise
    
    @staticmethod
    def generate_inventory_report(db: Session):
        """Inventory Report"""
        
        try:
            products = db.query(Product).all()
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            elements = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#667eea'),
                spaceAfter=30,
                alignment=1
            )
            
            # Title
            elements.append(Paragraph("📦 INVENTORY REPORT", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Inventory Table
            inventory_data = [['Product ID', 'Product Name', 'Stock', 'Price', 'Total Value']]
            
            total_value = 0
            for product in products:
                value = product.stock * product.price
                total_value += value
                inventory_data.append([
                    product.product_id,
                    product.name[:20],  # Truncate long names
                    str(product.stock),
                    f"₹{product.price:,.2f}",
                    f"₹{value:,.2f}"
                ])
            
            # Summary
            inventory_data.append(['', 'TOTAL', '', '', f"₹{total_value:,.2f}"])
            
            inventory_table = Table(inventory_data, colWidths=[1.2*inch, 1.8*inch, 1*inch, 1.2*inch, 1.2*inch])
            inventory_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef3c7')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.lightgrey])
            ]))
            
            elements.append(inventory_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Footer
            elements.append(Spacer(1, 0.5*inch))
            footer_text = f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            elements.append(Paragraph(footer_text, ParagraphStyle('footer', parent=styles['Normal'], fontSize=10, textColor=colors.grey)))
            
            doc.build(elements)
            buffer.seek(0)
            
            return buffer.getvalue()
        
        except Exception as e:
            print(f"❌ Error in generate_inventory_report: {e}")
            raise
    
    @staticmethod
    def generate_anomalies_report(db: Session):
        """Anomalies Report"""
        
        try:
            anomalies = db.query(Anomaly).order_by(Anomaly.created_at.desc()).limit(50).all()
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            elements = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#667eea'),
                spaceAfter=30,
                alignment=1
            )
            
            # Title
            elements.append(Paragraph("⚠️ ANOMALIES REPORT", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Stats
            high_count = len([a for a in anomalies if a.severity == 'HIGH'])
            medium_count = len([a for a in anomalies if a.severity == 'MEDIUM'])
            low_count = len([a for a in anomalies if a.severity == 'LOW'])
            
            stats_text = f"🔴 High: {high_count} | 🟡 Medium: {medium_count} | 🟢 Low: {low_count}"
            elements.append(Paragraph(stats_text, styles['Normal']))
            elements.append(Spacer(1, 0.3*inch))
            
            # Anomalies Table
            anomaly_data = [['Product', 'Type', 'Severity', 'Expected', 'Actual', 'Date']]
            
            for anomaly in anomalies[:30]:
                anomaly_data.append([
                    anomaly.product_id,
                    anomaly.anomaly_type.replace('_', ' ').upper()[:15],
                    anomaly.severity,
                    f"{anomaly.expected_value:.2f}",
                    f"{anomaly.value:.2f}",
                    anomaly.created_at.strftime('%Y-%m-%d')
                ])
            
            anomaly_table = Table(anomaly_data, colWidths=[1*inch, 1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            anomaly_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            
            elements.append(anomaly_table)
            
            # Footer
            elements.append(Spacer(1, 0.5*inch))
            footer_text = f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            elements.append(Paragraph(footer_text, ParagraphStyle('footer', parent=styles['Normal'], fontSize=10, textColor=colors.grey)))
            
            doc.build(elements)
            buffer.seek(0)
            
            return buffer.getvalue()
        
        except Exception as e:
            print(f"❌ Error in generate_anomalies_report: {e}")
            raise

print("✅ ReportGenerator loaded")