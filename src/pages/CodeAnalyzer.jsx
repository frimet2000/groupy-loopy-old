import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Bug, CheckCircle, AlertTriangle, AlertCircle, XCircle, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CodeAnalyzer() {
  const { language } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const severityColors = {
    critical: 'bg-red-600',
    high: 'bg-orange-600',
    medium: 'bg-yellow-600',
    low: 'bg-blue-600'
  };

  const severityIcons = {
    critical: XCircle,
    high: AlertCircle,
    medium: AlertTriangle,
    low: CheckCircle
  };

  const filesToAnalyze = [
    'pages/TripDetails.js',
    'pages/Home.js',
    'pages/Profile.js',
    'components/location/LiveLocationMap.jsx',
    'components/chat/TripChat.jsx',
    'components/trips/TripCard.jsx',
    'Layout.js'
  ];

  const analyzeCode = async () => {
    setAnalyzing(true);
    setResults(null);

    try {
      // Fetch file contents
      const fileContents = await Promise.all(
        filesToAnalyze.map(async (path) => {
          try {
            const response = await fetch(`/${path}`);
            const content = await response.text();
            return { path, content };
          } catch (error) {
            console.error(`Failed to fetch ${path}:`, error);
            return { path, content: '' };
          }
        })
      );

      // Filter out empty files
      const validFiles = fileContents.filter(f => f.content);

      // Call backend function
      const response = await base44.functions.invoke('analyzeCode', {
        files: validFiles
      });

      setResults(response.data.analysis);
      
      const issuesCount = response.data.analysis?.issues?.length || 0;
      
      if (issuesCount === 0) {
        toast.success(language === 'he' ? 'לא נמצאו שגיאות! 🎉' : 'No errors found! 🎉');
      } else {
        toast.warning(language === 'he' ? `נמצאו ${issuesCount} בעיות` : `Found ${issuesCount} issues`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(language === 'he' ? 'שגיאה בניתוח הקוד' : 'Error analyzing code');
    }

    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Bug className="w-8 h-8" />
                {language === 'he' ? 'מנתח שגיאות קוד חכם' : 'Smart Code Error Analyzer'}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {language === 'he' 
                  ? 'סורק אוטומטי לאיתור באגים ושגיאות בקוד האפליקציה'
                  : 'Automatic scanner to detect bugs and errors in application code'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-600" />
                    {language === 'he' ? 'קבצים לסריקה:' : 'Files to scan:'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filesToAnalyze.map(file => (
                      <div key={file} className="text-sm text-gray-600 bg-white px-3 py-2 rounded border border-gray-200">
                        {file}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={analyzeCode}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'he' ? 'מנתח קוד...' : 'Analyzing code...'}
                    </>
                  ) : (
                    <>
                      <Bug className="w-5 h-5 mr-2" />
                      {language === 'he' ? 'התחל ניתוח' : 'Start Analysis'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    {results.issues?.length === 0 ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        {language === 'he' ? 'ניתוח הושלם - הכל תקין!' : 'Analysis Complete - All Good!'}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-6 h-6" />
                        {language === 'he' ? `נמצאו ${results.issues?.length} בעיות` : `Found ${results.issues?.length} Issues`}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {results.summary && (
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                      <AlertDescription className="text-gray-700">
                        {results.summary}
                      </AlertDescription>
                    </Alert>
                  )}

                  {results.issues?.length > 0 ? (
                    <div className="space-y-4">
                      {results.issues.map((issue, index) => {
                        const SeverityIcon = severityIcons[issue.severity] || AlertCircle;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <SeverityIcon className={`w-5 h-5 mt-1 ${issue.severity === 'critical' ? 'text-red-600' : issue.severity === 'high' ? 'text-orange-600' : issue.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={severityColors[issue.severity]}>
                                    {issue.severity.toUpperCase()}
                                  </Badge>
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {issue.file}:{issue.line}
                                  </code>
                                </div>
                                <p className="font-semibold text-gray-900 mb-2">{issue.issue}</p>
                                <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold text-emerald-700">
                                      {language === 'he' ? '💡 פתרון מוצע:' : '💡 Suggested fix:'}
                                    </span>{' '}
                                    {issue.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {language === 'he' ? 'מצוין! 🎉' : 'Excellent! 🎉'}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'he' 
                          ? 'לא נמצאו שגיאות או בעיות בקוד'
                          : 'No errors or issues found in the code'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}