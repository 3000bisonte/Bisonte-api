// Servicio de email usando Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  // Enviar email de contacto
  async sendContactEmail(data) {
    try {
      const { firstName, lastName, email, phone, city, service, message } = data;
      
      const result = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@notificaciones.bisonteapp.com',
        to: [process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@notificaciones.bisonteapp.com'],
        subject: `Nuevo contacto de ${firstName} ${lastName} - ${service}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Bisonte Logística</h1>
              <p style="color: white; margin: 5px 0;">Nuevo mensaje de contacto</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #1e3c72;">Detalles del contacto:</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nombre:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${firstName} ${lastName}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Teléfono:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Ciudad:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${city}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Servicio:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${service}</td>
                </tr>
              </table>
              
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #1e3c72;">
                <h3 style="color: #1e3c72; margin-top: 0;">Mensaje:</h3>
                <p style="line-height: 1.6; color: #333;">${message}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 5px;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  📧 Responder a: <a href="mailto:${email}" style="color: #1e3c72;">${email}</a><br>
                  📱 Teléfono: ${phone}<br>
                  🏢 Ciudad: ${city}
                </p>
              </div>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">Bisonte Logística - Sistema de gestión empresarial</p>
              <p style="margin: 5px 0 0 0;">Este email fue generado automáticamente desde la aplicación móvil</p>
            </div>
          </div>
        `,
      });

      console.log('📧 Email enviado exitosamente:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error: error.message };
    }
  },

  // Enviar email de confirmación al usuario
  async sendConfirmationEmail(userData) {
    try {
      const { firstName, lastName, email, service } = userData;
      
      const result = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@notificaciones.bisonteapp.com',
        to: [email],
        subject: 'Confirmación de contacto - Bisonte Logística',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">¡Gracias por contactarnos!</h1>
              <p style="color: white; margin: 5px 0;">Bisonte Logística</p>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #1e3c72;">Hola ${firstName} ${lastName},</h2>
              
              <p style="line-height: 1.6; color: #333;">
                Gracias por contactarte con <strong>Bisonte Logística</strong>. Hemos recibido tu solicitud 
                sobre nuestro servicio de <strong>${service}</strong> y nuestro equipo la está revisando.
              </p>
              
              <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; margin: 20px 0;">
                <h3 style="color: #1e3c72; margin-top: 0;">📋 Próximos pasos:</h3>
                <ul style="color: #333; line-height: 1.6;">
                  <li>Revisaremos tu solicitud en las próximas 24 horas</li>
                  <li>Un especialista se pondrá en contacto contigo</li>
                  <li>Te proporcionaremos una cotización personalizada</li>
                  <li>Resolveremos todas tus dudas</li>
                </ul>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #28a745; margin-top: 0;">📞 ¿Necesitas ayuda inmediata?</h3>
                <p style="color: #333; margin-bottom: 0;">
                  Puedes contactarnos directamente:<br>
                  📧 Email: <a href="mailto:contacto@notificaciones.bisonteapp.com" style="color: #1e3c72;">contacto@notificaciones.bisonteapp.com</a><br>
                  📱 WhatsApp: <a href="https://wa.me/573000000000" style="color: #1e3c72;">+57 300 000 0000</a>
                </p>
              </div>
              
              <p style="color: #666; font-style: italic; text-align: center; margin-top: 30px;">
                Esperamos poder ayudarte pronto con tus necesidades logísticas.
              </p>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">Bisonte Logística - Tu socio en soluciones empresariales</p>
              <p style="margin: 5px 0 0 0;">Este es un email automático, no responder a esta dirección</p>
            </div>
          </div>
        `,
      });

      console.log('📧 Email de confirmación enviado:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Error enviando confirmación:', error);
      return { success: false, error: error.message };
    }
  },

  // Enviar notificación de nuevo envío
  async sendShipmentNotification(shipmentData) {
    try {
      const { tracking, recipient, sender, service } = shipmentData;
      
      const result = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@bisontelogistica.com',
        to: [recipient.email],
        subject: `Nuevo envío en tránsito - Tracking: ${tracking}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📦 Envío en Tránsito</h1>
              <p style="color: white; margin: 5px 0;">Bisonte Logística</p>
            </div>
            
            <div style="padding: 20px;">
              <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1e3c72; margin: 0;">Tracking: ${tracking}</h2>
                <p style="color: #666; margin: 5px 0;">Tu envío está en camino</p>
              </div>
              
              <h3 style="color: #1e3c72;">📋 Detalles del envío:</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Servicio:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${service}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Remitente:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${sender.name}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Destinatario:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${recipient.name}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Ciudad destino:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${recipient.city}</td>
                </tr>
              </table>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #28a745; margin-top: 0;">🔍 Rastrear envío</h3>
                <a href="https://bisontelogistica.com/tracking/${tracking}" 
                   style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Ver estado del envío
                </a>
              </div>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">Bisonte Logística - Seguimiento en tiempo real</p>
            </div>
          </div>
        `,
      });

      console.log('📧 Notificación de envío enviada:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      return { success: false, error: error.message };
    }
  },

  // Test de configuración
  async testEmailService() {
    try {
      const result = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@bisontelogistica.com',
        to: ['test@example.com'],
        subject: 'Test de configuración - Bisonte Logística',
        html: '<h1>✅ Resend configurado correctamente</h1><p>Este es un email de prueba.</p>',
      });

      console.log('✅ Test de email exitoso:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Error en test de email:', error);
      return { success: false, error: error.message };
    }
  }
};

export default emailService;
