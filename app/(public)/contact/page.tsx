// app/(public)/contact/page.tsx
"use client";

import PageHeader from "@/components/(public)/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const serviceId = 'service_d6ttodn';
      const templateId = 'template_pdvbihx';
      const publicKey = '1Hzn3cIba12k3xxg_';

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        to_name: 'KINY GROUP Team',
        to_email: 'ferdinandluis88@gmail.com',
      };

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      setSubmitStatus({
        type: 'success',
        message: 'Pesan Anda telah berhasil dikirim! Kami akan segera menghubungi Anda.'
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi atau hubungi kami melalui email/telepon.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Alamat Kantor",
      content: "Jl. Example Street No. 123, Jakarta Selatan, DKI Jakarta 12345",
      link: null
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Telepon",
      content: "+62 21 1234 5678",
      link: "tel:+622112345678"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      content: "info@kinygroup.com",
      link: "mailto:info@kinygroup.com"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Jam Operasional",
      content: "Senin - Jumat: 09:00 - 17:00 WIB",
      link: null
    }
  ];

  const socialMedia = [
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, link: "https://instagram.com/kinygroup" },
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, link: "https://facebook.com/kinygroup" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, link: "https://linkedin.com/company/kinygroup" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, link: "https://twitter.com/kinygroup" }
  ];

  return (
    <div className="min-h-screen bg-background pt-18">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <PageHeader 
          title="Contact Us"
          description="Mari terhubung dengan kami. Kami siap membantu mewujudkan visi Anda melalui layanan berkualitas tinggi."
          emphasizedWord="Us"
        />

        <div className="max-w-6xl mx-auto">
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
            {/* Left Column - Contact Information */}
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 border-b border-gold-500/20 pb-4">
                  Informasi Kontak
                </h2>
                
                <div className="space-y-6 md:space-y-8">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex gap-3 md:gap-4 group">
                      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-gold-400/10 to-gold-600/10 border border-gold-500/20 flex items-center justify-center text-gold-600 group-hover:border-gold-500/40 transition-all duration-300">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground mb-1 md:mb-2">
                          {info.title}
                        </h3>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            className="text-foreground hover:text-gold-600 transition-colors duration-200 text-sm md:text-base"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-foreground text-sm md:text-base">{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 border-b border-gold-500/20 pb-4">
                  Ikuti Kami
                </h3>
                <div className="flex gap-3 md:gap-4">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-gold-400/10 to-gold-600/10 border border-gold-500/20 hover:border-gold-500/40 flex items-center justify-center text-gold-600 hover:scale-110 transition-all duration-300"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 border-b border-gold-500/20 pb-4">
                  Lokasi Kami
                </h3>
                <div className="relative w-full h-[250px] md:h-[300px] rounded-lg overflow-hidden border border-gold-500/20 group">
                  <Image 
                    src="/assets/office-map.png" 
                    alt="KINY GROUP Office Location Map"
                    fill
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop&q=80";
                    }}
                  />
                  <a 
                    href="https://www.google.com/maps/place/Jl.+Tebet+Timur+Dalam+II+No.38b,+Tebet+Tim.,+Kec.+Tebet,+Kota+Jakarta+Selatan,+Daerah+Khusus+Ibukota+Jakarta+12820/@-6.2092445,106.8396213,13z/data=!4m6!3m5!1s0x2e69f39afffb49cf:0xcab046cfbd5d0b9c!8m2!3d-6.2289787!4d106.8561598!16s%2Fg%2F11tsjrykv3?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gold-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold shadow-xl text-sm md:text-base">
                      Buka di Google Maps
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-gold-500/20 rounded-lg p-6 md:p-8 lg:p-10 shadow-xl">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                  Kirim Pesan
                </h2>
                <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                  Isi formulir di bawah ini dan kami akan segera menghubungi Anda.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Lengkap <span className="text-gold-600">*</span>
                      </Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        required
                        className="border-gold-500/20 focus:border-gold-500 h-10 md:h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-gold-600">*</span>
                      </Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@email.com"
                        required
                        className="border-gold-500/20 focus:border-gold-500 h-10 md:h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Nomor Telepon
                      </Label>
                      <Input 
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+62 812 3456 7890"
                        className="border-gold-500/20 focus:border-gold-500 h-10 md:h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subjek <span className="text-gold-600">*</span>
                      </Label>
                      <Input 
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Topik pesan"
                        required
                        className="border-gold-500/20 focus:border-gold-500 h-10 md:h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Pesan <span className="text-gold-600">*</span>
                    </Label>
                    <Textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tuliskan pesan Anda di sini..."
                      required
                      rows={5}
                      className="border-gold-500/20 focus:border-gold-500 resize-none"
                    />
                  </div>

                  {submitStatus.type && (
                    <div 
                      className={`flex items-start gap-3 p-3 md:p-4 rounded-lg border ${
                        submitStatus.type === 'success' 
                          ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5" />
                      )}
                      <p className="text-xs md:text-sm leading-relaxed">{submitStatus.message}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white h-10 md:h-12 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gold-900/20 via-gold-800/10 to-card border border-gold-500/20 p-8 md:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-grid-white/5"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Siap Memulai Perjalanan Bersama Kami?
              </h3>
              <p className="text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
                Tim kami siap membantu Anda mewujudkan visi melalui program pendidikan, pertukaran budaya, dan layanan berkualitas tinggi kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                  onClick={() => document.getElementById('name')?.focus()}
                >
                  Hubungi Kami Sekarang
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gold-500/30 hover:bg-gold-500/10 hover:border-gold-500/50 transition-all duration-300 text-sm md:text-base"
                  onClick={() => window.location.href = '/about'}
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}