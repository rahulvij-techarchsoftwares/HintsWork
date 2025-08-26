const { sendEmail } = require("../service/email"); 

exports.contactForm = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, message } = req.body;

    if (!firstName || !lastName || !phone || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailData = {
      to: "backend1@techarchsoftwares.com", 
      subject: "New Demo Booking Submission",
      body: `
        <h3>New Demo Bookiing Form Submission</h3>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    const result = await sendEmail(emailData);

    if (result.success) {
      return res.status(200).json({ message: "Email sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send email", error: result.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
