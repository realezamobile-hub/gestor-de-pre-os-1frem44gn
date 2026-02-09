import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Smartphone, Loader2, CheckCircle2 } from 'lucide-react'
import { useWhatsAppStore } from '@/stores/useWhatsAppStore'

export function WhatsAppConnect() {
  const { connect, isConnecting } = useWhatsAppStore()
  const [step, setStep] = useState<'intro' | 'qr'>('intro')

  const handleConnect = async () => {
    await connect()
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[500px] bg-slate-50/50 p-6">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-emerald-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Conecte sua conta raiz para habilitar o atendimento compartilhado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'intro' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>Centralize todas as mensagens em um único painel.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>Identificação automática do vendedor nas respostas.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>Alertas de SLA para mensagens não respondidas.</p>
                </div>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                onClick={() => setStep('qr')}
              >
                Conectar Conta
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative w-64 h-64 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden group">
                {isConnecting ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-600">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span className="text-sm font-medium">Conectando...</span>
                  </div>
                ) : (
                  <>
                    <QrCode className="w-48 h-48 text-slate-800 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
                      <Button
                        onClick={handleConnect}
                        className="shadow-lg bg-emerald-600 hover:bg-emerald-700"
                      >
                        Simular Leitura do QR Code
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Abra o WhatsApp no seu celular, vá em <br />
                <strong>Aparelhos Conectados {'>'} Conectar Aparelho</strong>
              </p>
              <Button
                variant="ghost"
                onClick={() => setStep('intro')}
                disabled={isConnecting}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
