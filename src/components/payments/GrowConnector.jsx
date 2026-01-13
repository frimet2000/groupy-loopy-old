import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

const translations = {
  he: {
    title: 'חיבור Grow by Meshulam',
    subtitle: 'חבר את חשבון Grow שלך לעיבוד תשלומים',
    pageCode: 'קוד דף',
    userId: 'מזהה משתמש',
    connect: 'התחבר',
    connected: 'מחובר בהצלחה',
    disconnect: 'התנתק',
    testing: 'בדיקה...',
    connectingAccount: 'התחברות לחשבון...',
    testConnection: 'בדוק חיבור',
    connectionSuccess: 'חיבור בדוק בהצלחה!',
    connectionFailed: 'חיבור נכשל',
    enterCredentials: 'הכנס את פרטי הגישה שלך',
    requiredFields: 'שדות חובה',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'מזהה המשתמש שלך'
  },
  en: {
    title: 'Grow by Meshulam Connection',
    subtitle: 'Connect your Grow account to process payments',
    pageCode: 'Page Code',
    userId: 'User ID',
    connect: 'Connect',
    connected: 'Connected',
    disconnect: 'Disconnect',
    testing: 'Testing...',
    connectingAccount: 'Connecting account...',
    testConnection: 'Test Connection',
    connectionSuccess: 'Connection tested successfully!',
    connectionFailed: 'Connection failed',
    enterCredentials: 'Enter your access credentials',
    requiredFields: 'Required fields',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Your user ID'
  },
  ru: {
    title: 'Подключение Grow by Meshulam',
    subtitle: 'Подключите свой аккаунт Grow для обработки платежей',
    pageCode: 'Код страницы',
    userId: 'Идентификатор пользователя',
    connect: 'Подключить',
    connected: 'Подключено',
    disconnect: 'Отключить',
    testing: 'Тестирование...',
    connectingAccount: 'Подключение аккаунта...',
    testConnection: 'Протестировать соединение',
    connectionSuccess: 'Соединение протестировано успешно!',
    connectionFailed: 'Ошибка подключения',
    enterCredentials: 'Введите учетные данные доступа',
    requiredFields: 'Обязательные поля',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Ваш идентификатор'
  },
  es: {
    title: 'Conexión Grow by Meshulam',
    subtitle: 'Conecta tu cuenta Grow para procesar pagos',
    pageCode: 'Código de Página',
    userId: 'ID de Usuario',
    connect: 'Conectar',
    connected: 'Conectado',
    disconnect: 'Desconectar',
    testing: 'Probando...',
    connectingAccount: 'Conectando cuenta...',
    testConnection: 'Probar Conexión',
    connectionSuccess: '¡Conexión probada exitosamente!',
    connectionFailed: 'Error de conexión',
    enterCredentials: 'Ingresa tus credenciales de acceso',
    requiredFields: 'Campos requeridos',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Tu ID de usuario'
  },
  fr: {
    title: 'Connexion Grow by Meshulam',
    subtitle: 'Connectez votre compte Grow pour traiter les paiements',
    pageCode: 'Code de Page',
    userId: 'ID Utilisateur',
    connect: 'Connecter',
    connected: 'Connecté',
    disconnect: 'Déconnecter',
    testing: 'Test en cours...',
    connectingAccount: 'Connexion du compte...',
    testConnection: 'Tester la Connexion',
    connectionSuccess: 'Connexion testée avec succès!',
    connectionFailed: 'Erreur de connexion',
    enterCredentials: 'Entrez vos identifiants',
    requiredFields: 'Champs obligatoires',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Votre ID utilisateur'
  },
  de: {
    title: 'Grow by Meshulam-Verbindung',
    subtitle: 'Verbinden Sie Ihr Grow-Konto zur Zahlungsabwicklung',
    pageCode: 'Seitenzahl',
    userId: 'Benutzer-ID',
    connect: 'Verbinden',
    connected: 'Verbunden',
    disconnect: 'Trennen',
    testing: 'Wird getestet...',
    connectingAccount: 'Konto wird verbunden...',
    testConnection: 'Verbindung testen',
    connectionSuccess: 'Verbindung erfolgreich getestet!',
    connectionFailed: 'Verbindungsfehler',
    enterCredentials: 'Geben Sie Ihre Anmeldedaten ein',
    requiredFields: 'Erforderliche Felder',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Ihre Benutzer-ID'
  },
  it: {
    title: 'Connessione Grow by Meshulam',
    subtitle: 'Collega il tuo account Grow per elaborare i pagamenti',
    pageCode: 'Codice Pagina',
    userId: 'ID Utente',
    connect: 'Connetti',
    connected: 'Connesso',
    disconnect: 'Disconnetti',
    testing: 'Test in corso...',
    connectingAccount: 'Connessione dell\'account...',
    testConnection: 'Prova Connessione',
    connectionSuccess: 'Connessione testata con successo!',
    connectionFailed: 'Errore di connessione',
    enterCredentials: 'Inserisci le tue credenziali di accesso',
    requiredFields: 'Campi obbligatori',
    pageCodePlaceholder: 'xxx-xxxx-xxx',
    userIdPlaceholder: 'Il tuo ID utente'
  }
};

export default function GrowConnector({ isConnected, onConnectChange }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [pageCode, setPageCode] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(isConnected ? 'connected' : 'disconnected');

  const handleConnect = async (e) => {
    e?.preventDefault?.();
    
    if (!pageCode.trim() || !userId.trim()) {
      toast.error(t.requiredFields);
      return;
    }

    setLoading(true);
    try {
      // Save credentials to user profile
      await base44.auth.updateMe({
        grow_page_code: pageCode,
        grow_user_id: userId,
        grow_connected: true
      });
      
      setConnectionStatus('connected');
      onConnectChange?.(true);
      toast.success(t.connectionSuccess);
      setPageCode('');
      setUserId('');
    } catch (error) {
      toast.error(t.connectionFailed);
      console.error('Grow connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!pageCode.trim() || !userId.trim()) {
      toast.error(t.requiredFields);
      return;
    }

    setTesting(true);
    try {
      const response = await base44.functions.invoke('testGrowConnection', {
        pageCode: pageCode.trim(),
        userId: userId.trim()
      });

      if (response.data?.success) {
        toast.success(t.connectionSuccess);
      } else {
        toast.error(response.data?.error || t.connectionFailed);
      }
    } catch (error) {
      toast.error(t.connectionFailed);
      console.error('Test connection error:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({
        grow_connected: false,
        grow_page_code: null,
        grow_user_id: null
      });
      
      setConnectionStatus('disconnected');
      onConnectChange?.(false);
      toast.success(language === 'he' ? 'נותק בהצלחה' : 'Disconnected successfully');
      setPageCode('');
      setUserId('');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהתנתקות' : 'Disconnection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              {t.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">{t.connected}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {connectionStatus === 'connected' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{t.connected}</p>
                <p className="text-sm text-green-700">{language === 'he' ? 'חשבון Grow שלך פעיל ומוכן לעיבוד תשלומים' : 'Your Grow account is active and ready to process payments'}</p>
              </div>
            </div>
            <Button 
              onClick={handleDisconnect}
              disabled={loading}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.testing}
                </>
              ) : (
                t.disconnect
              )}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <p className="text-sm text-gray-600">{t.enterCredentials}</p>
            
            <div className="space-y-2">
              <Label htmlFor="pageCode">{t.pageCode}</Label>
              <Input
                id="pageCode"
                placeholder={t.pageCodePlaceholder}
                value={pageCode}
                onChange={(e) => setPageCode(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">{t.userId}</Label>
              <Input
                id="userId"
                placeholder={t.userIdPlaceholder}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={loading || testing || !pageCode.trim() || !userId.trim()}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.testing}
                  </>
                ) : (
                  t.testConnection
                )}
              </Button>

              <Button
                type="submit"
                disabled={loading || !pageCode.trim() || !userId.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.connectingAccount}
                  </>
                ) : (
                  t.connect
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}