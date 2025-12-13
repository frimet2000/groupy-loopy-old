import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Building2, Phone, Mail, Globe, Users, Code } from 'lucide-react';

export default function AboutUs() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const getContent = () => {
    if (language === 'he') {
      return {
    title: 'אודותינו',
    intro: 'The Group Loop פותחה על ידי פרימט מחשבים - צוות מקצועי המתמחה בשירותי מחשוב ויצירה דיגיטלית.',
    company: {
      name: 'פרימט מחשבים',
      tagline: 'שירותי מחשוב ויוצר דיגיטלי',
      description: 'אנחנו מספקים פתרונות טכנולוגיים מתקדמים, פיתוח אפליקציות, עיצוב ממשקים, ושירותי מחשוב מקיפים לעסקים ולארגונים.'
    },
    services: {
      title: 'השירותים שלנו',
      items: [
        'פיתוח אפליקציות ווב ומובייל',
        'עיצוב חווית משתמש וממשק (UX/UI)',
        'שירותי ייעוץ טכנולוגי',
        'פתרונות ענן ואחסון',
        'תמיכה טכנית ותחזוקה',
        'יצירת תוכן דיגיטלי'
      ]
    },
    mission: {
      title: 'המשימה שלנו',
      text: 'אנחנו מאמינים בכוח של הטכנולוגיה לחבר בין אנשים ולשפר את איכות החיים. The Group Loop נולדה מתוך הרצון ליצור פלטפורמה שמקלה על מטיילים למצוא שותפים לטיול ולחלוק חוויות בטבע.'
    },
    contact: {
      title: 'צור קשר',
      email: 'frimet@gmail.com'
      }
    };
    }
    
    if (language === 'ru') {
      return {
        title: 'О нас',
    intro: 'The Group Loop was developed by Perimat Computers - a professional team specializing in computing services and digital creation.',
    company: {
      name: 'Perimat Computers',
      tagline: 'Компьютерные услуги и цифровое творчество',
      description: 'Мы предоставляем передовые технологические решения, разработку приложений, дизайн интерфейсов и комплексные компьютерные услуги для бизнеса и организаций.'
    },
    services: {
      title: 'Наши услуги',
      items: [
        'Разработка веб и мобильных приложений',
        'Дизайн пользовательского опыта и интерфейсов (UX/UI)',
        'Услуги технологического консалтинга',
        'Облачные решения и хостинг',
        'Техническая поддержка и обслуживание',
        'Создание цифрового контента'
      ]
    },
    mission: {
      title: 'Наша миссия',
      text: 'Мы верим в силу технологий для объединения людей и улучшения качества жизни. The Group Loop родилась из желания создать платформу, которая упрощает путешественникам поиск партнеров для поездок и обмен впечатлениями на природе.'
    },
    contact: {
      title: 'О нас',
      email: 'frimet@gmail.com'
    }
  };
}
    
    return {
      title: 'About Us',
      intro: 'The Group Loop was developed by Perimat Computers - a professional team specializing in computing services and digital creation.',
      company: {
        name: 'Perimat Computers',
        tagline: 'Computing Services & Digital Creation',
        description: 'We provide advanced technological solutions, app development, interface design, and comprehensive computing services for businesses and organizations.'
      },
      services: {
        title: 'Our Services',
        items: [
          'Web and mobile app development',
          'User experience and interface design (UX/UI)',
          'Technology consulting services',
          'Cloud and hosting solutions',
          'Technical support and maintenance',
          'Digital content creation'
        ]
      },
      mission: {
        title: 'Our Mission',
        text: 'We believe in the power of technology to connect people and improve quality of life. The Group Loop was born from the desire to create a platform that makes it easy for travelers to find trip partners and share experiences in nature.'
      },
      contact: {
        title: 'Свяжитесь с нами',
        email: 'frimet@gmail.com'
      }
    };
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>

        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              <CardTitle className="text-3xl" dir={isRTL ? 'rtl' : 'ltr'}>{content.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Intro */}
            <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
              <p className="text-gray-700 leading-relaxed text-lg">{content.intro}</p>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{content.company.name}</h2>
                  <p className="text-emerald-600 font-semibold">{content.company.tagline}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{content.company.description}</p>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{content.services.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.services.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-900">{content.mission.title}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{content.mission.text}</p>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                {content.contact.title}
              </h2>
              <div className="space-y-3">
                <a 
                  href={`mailto:${content.contact.email}`}
                  className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-3 transition-colors"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-emerald-100">{language === 'he' ? 'דוא"ל' : 'Email'}</div>
                    <div className="font-semibold" dir="ltr">{content.contact.email}</div>
                  </div>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}