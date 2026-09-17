import EnquiryForm from "../../components/property/EnquiryForm.jsx";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <p className="contact-intro">Have a question about a project or unit? Send us a message.</p>
      <EnquiryForm submitLabel="Send Message" />
    </div>
  );
}

export default Contact;
