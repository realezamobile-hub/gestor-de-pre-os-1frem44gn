import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Copy, Globe, Server, CheckCircle2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function DomainSettings() {
  const [copied, setCopied] = useState<string | null>(null)

  const domainInfo = {
    subdomain: 'gestorlista',
    domain: 'realezamobile.com.br',
    target: 'app-lista-de-precos.skip.app',
    fullUrl: 'https://gestorlista.realezamobile.com.br',
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copiado para a área de transferência')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Configuração de Domínio Personalizado
          </CardTitle>
          <CardDescription>
            Configure o acesso através de <strong>{domainInfo.fullUrl}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            Para utilizar seu domínio personalizado, você precisa adicionar um
            registro DNS no painel do seu provedor (Registro.br).
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Endereço Desejado (URL)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={domainInfo.fullUrl}
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(domainInfo.fullUrl, 'url')}
                >
                  {copied === 'url' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status do SSL</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-green-50 text-green-700 border-green-200 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Automático (Let's Encrypt)
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Registros DNS Necessários
            </h3>

            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-xs uppercase text-muted-foreground border-b">
                <div className="col-span-3">Tipo</div>
                <div className="col-span-4">Nome (Entrada)</div>
                <div className="col-span-5">Dados (Valor)</div>
              </div>
              <div className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                <div className="col-span-3 font-mono">CNAME</div>
                <div className="col-span-4 flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {domainInfo.subdomain}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      copyToClipboard(domainInfo.subdomain, 'name')
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded truncate flex-1">
                    {domainInfo.target}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(domainInfo.target, 'target')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <a
                href="https://registro.br/tecnologia/ferramentas/dns/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ajuda do Registro.br
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
