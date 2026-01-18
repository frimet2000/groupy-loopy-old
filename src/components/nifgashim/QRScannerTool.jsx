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
  CameraOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Calendar,
  Phone,
  Loader2,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function QRScannerTool({ trekDays = [], language = 'he', isRTL = false }) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDay, setSelectedDay] = useState('all');
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const translations = {
    he: {
      title: 'סורק QR - צ\'ק-אין משתתפים',
      startScan: 'התחל סריקה',
      stopScan: 'עצור סריקה',
      selectDay: 'בחר יום טיול',
      allDays: 'כל הימים',
      day: 'יום',
      scanning: 'סורק...',
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
      todayCheckIns: 'צ\'ק-אינים היום',
      totalCheckIns: 'סה״כ צ\'ק-אינים',
      recentScans: 'סריקות אחרונות',
      cameraPermission: 'נא לאשר גישה למצלמה',
      cameraError: 'שגיאה בפתיחת המצלמה',
      wrongDay: 'משתתף לא רשום ליום זה'
    },
    en: {
      title: 'QR Scanner - Participant Check-In',
      startScan: 'Start Scanning',
      stopScan: 'Stop Scanning',
      selectDay: 'Select Trek Day',
      allDays: 'All Days',
      day: 'Day',
      scanning: 'Scanning...',
      verified: 'Verified Successfully!',
      alreadyCheckedIn: 'Already Checked In',
      notRegistered: 'Not Registered for This Day',
      invalidQR: 'Invalid QR Code',
      notFound: 'Registration Not Found',
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
      todayCheckIns: 'Today\'s Check-Ins',
      totalCheckIns: 'Total Check-Ins',
      recentScans: 'Recent Scans',
      cameraPermission: 'Please allow camera access',
      cameraError: 'Error opening camera',
      wrongDay: 'Participant not registered for this day'
    },
    ru: {
      title: 'QR Сканер - Регистрация участников',
      startScan: 'Начать сканирование',
      stopScan: 'Остановить',
      selectDay: 'Выберите день',
      allDays: 'Все дни',
      day: 'День',
      scanning: 'Сканирование...',
      verified: 'Подтверждено!',
      alreadyCheckedIn: 'Уже зарегистрирован',
      notRegistered: 'Не зарегистрирован на этот день',
      invalidQR: 'Недействительный QR',
      notFound: 'Регистрация не найдена',
      participant: 'Участник',
      phone: 'Телефон',
      people: 'Людей',
      registeredDays: 'Зарегистрированные дни',
      payment: 'Оплата',
      paid: 'Оплачено',
      pending: 'Ожидание',
      exempt: 'Освобожден',
      group: 'Группа',
      checkedInAt: 'Время регистрации',
      todayCheckIns: 'Регистраций сегодня',
      totalCheckIns: 'Всего регистраций',
      recentScans: 'Последние сканирования',
      cameraPermission: 'Разрешите доступ к камере',
      cameraError: 'Ошибка камеры',
      wrongDay: 'Участник не зарегистрирован на этот день'
    },
    es: {
      title: 'Escáner QR - Check-In de Participantes',
      startScan: 'Iniciar Escaneo',
      stopScan: 'Detener',
      selectDay: 'Seleccionar Día',
      allDays: 'Todos los Días',
      day: 'Día',
      scanning: 'Escaneando...',
      verified: '¡Verificado!',
      alreadyCheckedIn: 'Ya registrado',
      notRegistered: 'No registrado para este día',
      invalidQR: 'QR Inválido',
      notFound: 'Registro no encontrado',
      participant: 'Participante',
      phone: 'Teléfono',
      people: 'Personas',
      registeredDays: 'Días registrados',
      payment: 'Pago',
      paid: 'Pagado',
      pending: 'Pendiente',
      exempt: 'Exento',
      group: 'Grupo',
      checkedInAt: 'Registrado a las',
      todayCheckIns: 'Check-ins hoy',
      totalCheckIns: 'Total check-ins',
      recentScans: 'Escaneos recientes',
      cameraPermission: 'Permita el acceso a la cámara',
      cameraError: 'Error de cámara',
      wrongDay: 'Participante no registrado para este día'
    },
    fr: {
      title: 'Scanner QR - Enregistrement des Participants',
      startScan: 'Commencer',
      stopScan: 'Arrêter',
      selectDay: 'Sélectionner le Jour',
      allDays: 'Tous les Jours',
      day: 'Jour',
      scanning: 'Scan en cours...',
      verified: 'Vérifié!',
      alreadyCheckedIn: 'Déjà enregistré',
      notRegistered: 'Non inscrit pour ce jour',
      invalidQR: 'QR Invalide',
      notFound: 'Inscription non trouvée',
      participant: 'Participant',
      phone: 'Téléphone',
      people: 'Personnes',
      registeredDays: 'Jours inscrits',
      payment: 'Paiement',
      paid: 'Payé',
      pending: 'En attente',
      exempt: 'Exempté',
      group: 'Groupe',
      checkedInAt: 'Enregistré à',
      todayCheckIns: 'Enregistrements aujourd\'hui',
      totalCheckIns: 'Total enregistrements',
      recentScans: 'Scans récents',
      cameraPermission: 'Autorisez l\'accès à la caméra',
      cameraError: 'Erreur de caméra',
      wrongDay: 'Participant non inscrit pour ce jour'
    },
    de: {
      title: 'QR-Scanner - Teilnehmer Check-In',
      startScan: 'Scan starten',
      stopScan: 'Stoppen',
      selectDay: 'Tag auswählen',
      allDays: 'Alle Tage',
      day: 'Tag',
      scanning: 'Scanne...',
      verified: 'Verifiziert!',
      alreadyCheckedIn: 'Bereits eingecheckt',
      notRegistered: 'Nicht für diesen Tag registriert',
      invalidQR: 'Ungültiger QR',
      notFound: 'Registrierung nicht gefunden',
      participant: 'Teilnehmer',
      phone: 'Telefon',
      people: 'Personen',
      registeredDays: 'Registrierte Tage',
      payment: 'Zahlung',
      paid: 'Bezahlt',
      pending: 'Ausstehend',
      exempt: 'Befreit',
      group: 'Gruppe',
      checkedInAt: 'Eingecheckt um',
      todayCheckIns: 'Check-ins heute',
      totalCheckIns: 'Gesamt Check-ins',
      recentScans: 'Letzte Scans',
      cameraPermission: 'Bitte Kamerazugriff erlauben',
      cameraError: 'Kamerafehler',
      wrongDay: 'Teilnehmer nicht für diesen Tag registriert'
    },
    it: {
      title: 'Scanner QR - Check-In Partecipanti',
      startScan: 'Avvia Scansione',
      stopScan: 'Ferma',
      selectDay: 'Seleziona Giorno',
      allDays: 'Tutti i Giorni',
      day: 'Giorno',
      scanning: 'Scansione...',
      verified: 'Verificato!',
      alreadyCheckedIn: 'Già registrato',
      notRegistered: 'Non registrato per questo giorno',
      invalidQR: 'QR Non Valido',
      notFound: 'Registrazione non trovata',
      participant: 'Partecipante',
      phone: 'Telefono',
      people: 'Persone',
      registeredDays: 'Giorni registrati',
      payment: 'Pagamento',
      paid: 'Pagato',
      pending: 'In attesa',
      exempt: 'Esente',
      group: 'Gruppo',
      checkedInAt: 'Registrato alle',
      todayCheckIns: 'Check-in oggi',
      totalCheckIns: 'Totale check-in',
      recentScans: 'Scansioni recenti',
      cameraPermission: 'Consentire l\'accesso alla fotocamera',
      cameraError: 'Errore fotocamera',
      wrongDay: 'Partecipante non registrato per questo giorno'
    }
  };

  const t = translations[language] || translations.en;

  // Play success/error sound
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
      } else {
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.2;
      }
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      // Sound not supported
    }
  };

  const startScanner = async () => {
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
          // Prevent multiple scans of same code
          if (verifying) return;
          
          setVerifying(true);
          await handleScan(decodedText);
          setVerifying(false);
        },
        (errorMessage) => {
          // Ignore scan errors (no QR found)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error(t.cameraError);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    setIsScanning(false);
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

      if (result.success) {
        playSound('success');
        setStats(prev => ({ ...prev, total: prev.total + 1, today: prev.today + 1 }));
        toast.success(`✅ ${result.participantName} - ${t.verified}`);
      } else {
        playSound('error');
        if (result.status === 'already_checked_in') {
          toast.warning(`⚠️ ${result.participantName} - ${t.alreadyCheckedIn}`);
        } else if (result.status === 'wrong_day') {
          toast.error(`❌ ${t.wrongDay}`);
        } else {
          toast.error(`❌ ${t[result.status] || result.message}`);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      playSound('error');
      setLastScan({ success: false, status: 'error', message: error.message });
      toast.error(t.invalidQR);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'already_checked_in': return 'bg-yellow-500';
      case 'wrong_day': return 'bg-orange-500';
      case 'not_found': return 'bg-red-500';
      case 'invalid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'already_checked_in': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default: return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{t.title}</h2>
                <p className="text-sm text-white/80">
                  {t.todayCheckIns}: {stats.today} | {t.totalCheckIns}: {stats.total}
                </p>
              </div>
            </div>
            
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
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

      {/* Scanner Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* QR Scanner Container */}
            <div 
              id="qr-reader" 
              ref={scannerRef}
              className={`w-full ${isScanning ? 'min-h-[300px] sm:min-h-[400px]' : 'h-0'}`}
              style={{ 
                background: '#000',
                transition: 'min-height 0.3s ease'
              }}
            />

            {!isScanning && (
              <div className="p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-24 h-24 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-indigo-600" />
                </div>
                <p className="text-gray-600 mb-4">{t.cameraPermission}</p>
              </div>
            )}

            {verifying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Control Button */}
          <div className="p-4 bg-white border-t">
            <Button
              onClick={isScanning ? stopScanner : startScanner}
              className={`w-full h-14 text-lg font-bold ${
                isScanning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-6 h-6 mr-2" />
                  {t.stopScan}
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 mr-2" />
                  {t.startScan}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Scan Result */}
      <AnimatePresence>
        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-2 ${
              lastScan.success 
                ? 'border-green-400 bg-green-50' 
                : lastScan.status === 'already_checked_in'
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-red-400 bg-red-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    lastScan.success ? 'bg-green-100' : 
                    lastScan.status === 'already_checked_in' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {getStatusIcon(lastScan.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">
                        {lastScan.participantName || t.participant}
                      </h3>
                      <Badge className={getStatusColor(lastScan.status)}>
                        {lastScan.success ? t.verified : t[lastScan.status] || lastScan.message}
                      </Badge>
                    </div>

                    {lastScan.success && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{lastScan.totalPeople} {t.people}</span>
                        </div>
                        
                        {lastScan.participantPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span dir="ltr">{lastScan.participantPhone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{t.registeredDays}: {lastScan.registeredDays?.join(', ')}</span>
                        </div>
                        
                        <div>
                          <Badge className={
                            lastScan.paymentStatus === 'completed' ? 'bg-green-500' :
                            lastScan.paymentStatus === 'exempt' ? 'bg-blue-500' : 'bg-yellow-500'
                          }>
                            {t.payment}: {t[lastScan.paymentStatus] || lastScan.paymentStatus}
                          </Badge>
                        </div>

                        {lastScan.isGroup && (
                          <div className="col-span-2">
                            <Badge variant="outline" className="border-purple-300 bg-purple-50">
                              {t.group}: {lastScan.groupName}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {lastScan.status === 'already_checked_in' && lastScan.checkedInAt && (
                      <p className="text-sm text-yellow-700 mt-2">
                        {t.checkedInAt}: {new Date(lastScan.checkedInAt).toLocaleTimeString()}
                      </p>
                    )}

                    {lastScan.status === 'wrong_day' && lastScan.registeredDays && (
                      <p className="text-sm text-orange-700 mt-2">
                        {t.registeredDays}: {lastScan.registeredDays.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Scans History */}
      {scanHistory.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t.recentScans}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scanHistory.slice(1, 10).map((scan, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    scan.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scan.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{scan.participantName || '-'}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(scan.scannedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}