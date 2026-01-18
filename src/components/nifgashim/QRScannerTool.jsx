// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Calendar,
  Phone,
  Loader2,
  RefreshCw,
  ArrowRight,
  ScanLine,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function QRScannerTool({ trekDays = [], language = 'he', isRTL = false }) {
  const [scannerState, setScannerState] = useState('idle'); // idle, scanning, result, verifying
  const [selectedDay, setSelectedDay] = useState('all');
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const html5QrCodeRef = useRef(null);

  const translations = {
    he: {
      title: 'סורק QR - צ\'ק-אין',
      startScan: 'התחל סריקה',
      nextScan: 'סרוק הבא',
      selectDay: 'בחר יום',
      allDays: 'כל הימים',
      day: 'יום',
      scanning: 'מחפש קוד QR...',
      verified: 'אומת בהצלחה!',
      alreadyCheckedIn: 'כבר נרשם היום',
      notRegistered: 'לא רשום ליום זה',
      invalidQR: 'קוד QR לא תקין',
      notFound: 'הרשמה לא נמצאה',
      participant: 'משתתף',
      phone: 'טלפון',
      people: 'אנשים',
      registeredDays: 'ימים רשומים',
      payment: 'תשלום',
      paid: 'שולם',
      pending: 'ממתין',
      exempt: 'פטור',
      group: 'קבוצה',
      checkedInAt: 'נסרק בשעה',
      todayCheckIns: 'היום',
      totalCheckIns: 'סה״כ',
      recentScans: 'סריקות אחרונות',
      cameraError: 'שגיאה בפתיחת המצלמה',
      wrongDay: 'לא רשום ליום זה',
      checkInSuccess: 'צ\'ק-אין הושלם',
      continueToNext: 'המשך לסריקה הבאה',
      tapToStart: 'לחץ להתחלת סריקה'
    },
    en: {
      title: 'QR Scanner - Check-In',
      startScan: 'Start Scanning',
      nextScan: 'Scan Next',
      selectDay: 'Select Day',
      allDays: 'All Days',
      day: 'Day',
      scanning: 'Looking for QR code...',
      verified: 'Verified!',
      alreadyCheckedIn: 'Already Checked In',
      notRegistered: 'Not Registered',
      invalidQR: 'Invalid QR',
      notFound: 'Not Found',
      participant: 'Participant',
      phone: 'Phone',
      people: 'People',
      registeredDays: 'Registered Days',
      payment: 'Payment',
      paid: 'Paid',
      pending: 'Pending',
      exempt: 'Exempt',
      group: 'Group',
      checkedInAt: 'Checked In At',
      todayCheckIns: 'Today',
      totalCheckIns: 'Total',
      recentScans: 'Recent',
      cameraError: 'Camera error',
      wrongDay: 'Wrong day',
      checkInSuccess: 'Check-in complete',
      continueToNext: 'Continue to next',
      tapToStart: 'Tap to start scanning'
    },
    ru: {
      title: 'QR Сканер - Регистрация',
      startScan: 'Начать',
      nextScan: 'Следующий',
      selectDay: 'Выбрать день',
      allDays: 'Все дни',
      day: 'День',
      scanning: 'Поиск QR...',
      verified: 'Подтверждено!',
      alreadyCheckedIn: 'Уже зарегистрирован',
      notRegistered: 'Не зарегистрирован',
      invalidQR: 'Недействительный QR',
      notFound: 'Не найдено',
      participant: 'Участник',
      phone: 'Телефон',
      people: 'Людей',
      registeredDays: 'Дни',
      payment: 'Оплата',
      paid: 'Оплачено',
      pending: 'Ожидание',
      exempt: 'Освобожден',
      group: 'Группа',
      checkedInAt: 'Время',
      todayCheckIns: 'Сегодня',
      totalCheckIns: 'Всего',
      recentScans: 'Последние',
      cameraError: 'Ошибка камеры',
      wrongDay: 'Неверный день',
      checkInSuccess: 'Регистрация завершена',
      continueToNext: 'Продолжить',
      tapToStart: 'Нажмите для сканирования'
    },
    es: {
      title: 'Escáner QR - Check-In',
      startScan: 'Iniciar',
      nextScan: 'Siguiente',
      selectDay: 'Seleccionar día',
      allDays: 'Todos',
      day: 'Día',
      scanning: 'Buscando QR...',
      verified: '¡Verificado!',
      alreadyCheckedIn: 'Ya registrado',
      notRegistered: 'No registrado',
      invalidQR: 'QR inválido',
      notFound: 'No encontrado',
      participant: 'Participante',
      phone: 'Teléfono',
      people: 'Personas',
      registeredDays: 'Días',
      payment: 'Pago',
      paid: 'Pagado',
      pending: 'Pendiente',
      exempt: 'Exento',
      group: 'Grupo',
      checkedInAt: 'Hora',
      todayCheckIns: 'Hoy',
      totalCheckIns: 'Total',
      recentScans: 'Recientes',
      cameraError: 'Error de cámara',
      wrongDay: 'Día incorrecto',
      checkInSuccess: 'Check-in completado',
      continueToNext: 'Continuar',
      tapToStart: 'Toca para escanear'
    },
    fr: {
      title: 'Scanner QR - Check-In',
      startScan: 'Commencer',
      nextScan: 'Suivant',
      selectDay: 'Jour',
      allDays: 'Tous',
      day: 'Jour',
      scanning: 'Recherche QR...',
      verified: 'Vérifié!',
      alreadyCheckedIn: 'Déjà enregistré',
      notRegistered: 'Non inscrit',
      invalidQR: 'QR invalide',
      notFound: 'Non trouvé',
      participant: 'Participant',
      phone: 'Téléphone',
      people: 'Personnes',
      registeredDays: 'Jours',
      payment: 'Paiement',
      paid: 'Payé',
      pending: 'En attente',
      exempt: 'Exempté',
      group: 'Groupe',
      checkedInAt: 'Heure',
      todayCheckIns: "Aujourd'hui",
      totalCheckIns: 'Total',
      recentScans: 'Récents',
      cameraError: 'Erreur caméra',
      wrongDay: 'Mauvais jour',
      checkInSuccess: 'Enregistrement terminé',
      continueToNext: 'Continuer',
      tapToStart: 'Appuyez pour scanner'
    },
    de: {
      title: 'QR-Scanner - Check-In',
      startScan: 'Starten',
      nextScan: 'Nächster',
      selectDay: 'Tag wählen',
      allDays: 'Alle',
      day: 'Tag',
      scanning: 'Suche QR...',
      verified: 'Verifiziert!',
      alreadyCheckedIn: 'Bereits eingecheckt',
      notRegistered: 'Nicht registriert',
      invalidQR: 'Ungültiger QR',
      notFound: 'Nicht gefunden',
      participant: 'Teilnehmer',
      phone: 'Telefon',
      people: 'Personen',
      registeredDays: 'Tage',
      payment: 'Zahlung',
      paid: 'Bezahlt',
      pending: 'Ausstehend',
      exempt: 'Befreit',
      group: 'Gruppe',
      checkedInAt: 'Zeit',
      todayCheckIns: 'Heute',
      totalCheckIns: 'Gesamt',
      recentScans: 'Letzte',
      cameraError: 'Kamerafehler',
      wrongDay: 'Falscher Tag',
      checkInSuccess: 'Check-in abgeschlossen',
      continueToNext: 'Weiter',
      tapToStart: 'Tippen zum Scannen'
    },
    it: {
      title: 'Scanner QR - Check-In',
      startScan: 'Inizia',
      nextScan: 'Prossimo',
      selectDay: 'Giorno',
      allDays: 'Tutti',
      day: 'Giorno',
      scanning: 'Ricerca QR...',
      verified: 'Verificato!',
      alreadyCheckedIn: 'Già registrato',
      notRegistered: 'Non registrato',
      invalidQR: 'QR non valido',
      notFound: 'Non trovato',
      participant: 'Partecipante',
      phone: 'Telefono',
      people: 'Persone',
      registeredDays: 'Giorni',
      payment: 'Pagamento',
      paid: 'Pagato',
      pending: 'In attesa',
      exempt: 'Esente',
      group: 'Gruppo',
      checkedInAt: 'Ora',
      todayCheckIns: 'Oggi',
      totalCheckIns: 'Totale',
      recentScans: 'Recenti',
      cameraError: 'Errore fotocamera',
      wrongDay: 'Giorno sbagliato',
      checkInSuccess: 'Check-in completato',
      continueToNext: 'Continua',
      tapToStart: 'Tocca per scansionare'
    }
  };

  const t = translations[language] || translations.en;

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 1100;
        }, 100);
        setTimeout(() => oscillator.stop(), 200);
      } else {
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.2;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 300);
      }
    } catch (e) {}
  };

  const startScanner = async () => {
    setScannerState('scanning');
    setLastScan(null);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // Stop scanner immediately on detection
          await stopScanner();
          setScannerState('verifying');
          await handleScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      toast.error(t.cameraError);
      setScannerState('idle');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {}
    }
  };

  const handleScan = async (qrData) => {
    try {
      const dayNumber = selectedDay !== 'all' ? parseInt(selectedDay) : null;
      
      const response = await base44.functions.invoke('verifyParticipantQR', {
        qrData,
        dayNumber
      });

      const result = response.data;
      
      const scanResult = {
        ...result,
        scannedAt: new Date().toISOString()
      };

      setLastScan(scanResult);
      setScanHistory(prev => [scanResult, ...prev.slice(0, 19)]);
      setScannerState('result');

      if (result.success) {
        playSound('success');
        setStats(prev => ({ ...prev, total: prev.total + 1, today: prev.today + 1 }));
      } else {
        playSound('error');
      }
    } catch (error) {
      console.error('Verification error:', error);
      playSound('error');
      setLastScan({ success: false, status: 'invalid', message: error.message });
      setScannerState('result');
    }
  };

  const handleNextScan = () => {
    startScanner();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Compact Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              <span className="font-bold text-sm">{t.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>{t.todayCheckIns}: <strong>{stats.today}</strong></span>
              <span>{t.totalCheckIns}: <strong>{stats.total}</strong></span>
            </div>
          </div>
          
          <div className="mt-2">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full h-8 bg-white/20 border-white/30 text-white text-sm">
                <SelectValue placeholder={t.selectDay} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allDays}</SelectItem>
                {trekDays.map(day => (
                  <SelectItem key={day.day_number} value={String(day.day_number)}>
                    {t.day} {day.day_number} {day.daily_title ? `- ${day.daily_title}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Scanner/Result Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {/* Idle State - Show Start Button */}
            {scannerState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <Button
                  onClick={startScanner}
                  className="w-full h-32 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg"
                >
                  <Camera className="w-12 h-12" />
                  <span className="text-lg font-bold">{t.startScan}</span>
                </Button>
              </motion.div>
            )}

            {/* Scanning State - Show Camera */}
            {scannerState === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div 
                  id="qr-reader" 
                  className="w-full min-h-[350px]"
                  style={{ background: '#000' }}
                />
                <div className="bg-indigo-600 text-white p-3 text-center flex items-center justify-center gap-2">
                  <ScanLine className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">{t.scanning}</span>
                </div>
              </motion.div>
            )}

            {/* Verifying State */}
            {scannerState === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center justify-center"
              >
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">מאמת...</p>
              </motion.div>
            )}

            {/* Result State - Show Scan Result */}
            {scannerState === 'result' && lastScan && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Result Header */}
                <div className={`p-6 text-center ${
                  lastScan.success 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : lastScan.status === 'already_checked_in'
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                } text-white`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    {lastScan.success ? (
                      <CheckCircle className="w-20 h-20 mx-auto mb-3" />
                    ) : lastScan.status === 'already_checked_in' ? (
                      <AlertTriangle className="w-20 h-20 mx-auto mb-3" />
                    ) : (
                      <XCircle className="w-20 h-20 mx-auto mb-3" />
                    )}
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold mb-1">
                    {lastScan.participantName || t.participant}
                  </h2>
                  <p className="text-lg opacity-90">
                    {lastScan.success ? t.checkInSuccess : 
                     lastScan.status === 'already_checked_in' ? t.alreadyCheckedIn :
                     lastScan.status === 'wrong_day' ? t.wrongDay :
                     lastScan.status === 'not_found' ? t.notFound :
                     t.invalidQR}
                  </p>
                </div>

                {/* Participant Details */}
                {(lastScan.success || lastScan.status === 'already_checked_in' || lastScan.status === 'wrong_day') && (
                  <div className="p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {lastScan.totalPeople && (
                        <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <Users className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-xs text-gray-500">{t.people}</p>
                            <p className="font-bold">{lastScan.totalPeople}</p>
                          </div>
                        </div>
                      )}
                      
                      {lastScan.participantPhone && (
                        <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500">{t.phone}</p>
                            <p className="font-bold text-sm" dir="ltr">{lastScan.participantPhone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {lastScan.registeredDays && (
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-gray-600">{t.registeredDays}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lastScan.registeredDays.map(day => (
                            <Badge key={day} variant="secondary" className="bg-purple-100 text-purple-700">
                              {t.day} {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {lastScan.paymentStatus && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{t.payment}:</span>
                        <Badge className={
                          lastScan.paymentStatus === 'completed' ? 'bg-green-500' :
                          lastScan.paymentStatus === 'exempt' ? 'bg-blue-500' : 'bg-yellow-500'
                        }>
                          {lastScan.paymentStatus === 'completed' ? t.paid :
                           lastScan.paymentStatus === 'exempt' ? t.exempt : t.pending}
                        </Badge>
                      </div>
                    )}

                    {lastScan.isGroup && lastScan.groupName && (
                      <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-sm">{t.group}: <strong>{lastScan.groupName}</strong></span>
                      </div>
                    )}

                    {lastScan.status === 'already_checked_in' && lastScan.checkedInAt && (
                      <div className="bg-yellow-50 rounded-xl p-3 text-center text-yellow-800">
                        {t.checkedInAt}: {new Date(lastScan.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Continue Button */}
                <div className="p-4 border-t">
                  <Button
                    onClick={handleNextScan}
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg"
                  >
                    <ScanLine className="w-6 h-6 mr-2" />
                    {t.nextScan}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Recent Scans - Compact */}
      {scanHistory.length > 0 && scannerState !== 'scanning' && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4" />
              {t.recentScans}
            </div>
            <div className="flex flex-wrap gap-2">
              {scanHistory.slice(0, 8).map((scan, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className={`${
                    scan.success ? 'border-green-300 bg-green-50 text-green-700' : 
                    scan.status === 'already_checked_in' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                    'border-red-300 bg-red-50 text-red-700'
                  }`}
                >
                  {scan.success ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                   scan.status === 'already_checked_in' ? <AlertTriangle className="w-3 h-3 mr-1" /> :
                   <XCircle className="w-3 h-3 mr-1" />}
                  {scan.participantName?.split(' ')[0] || '-'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}