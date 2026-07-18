from app.services.notifications import send_email_alert

@router.post("/ticket/")
async def create_support_ticket(
    subject: str,
    message: str,
    product_id: str,
    customer_email: str,
    db: Session = Depends(get_db)
):
    """Customer support ticket"""
    
    ticket = SupportTicket(
        subject=subject,
        message=message,
        product_id=product_id,
        customer_email=customer_email,
        status="open"
    )
    
    db.add(ticket)
    db.commit()
    
    # ✅ Admin को notify करो
    await send_email_alert(
        to_email="admin@smartretail.com",
        subject=f"New Support Ticket: {subject}",
        body=f"Customer: {customer_email}\nMessage: {message}"
    )
    
    # ✅ Customer को confirmation भेजो
    await send_email_alert(
        to_email=customer_email,
        subject="We received your ticket",
        body=f"Your ticket #{ticket.id} has been received. We'll respond soon!"
    )
    
    return {"ticket_id": ticket.id, "status": "submitted"}