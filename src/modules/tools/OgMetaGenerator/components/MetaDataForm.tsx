import { Settings, Palette } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  locale: string
  twitterCard: string
  twitterSite: string
  twitterCreator: string
}

interface MetaDataFormProps {
  metaData: MetaData
  updateField: (field: keyof MetaData, value: string) => void
  ogTypes: string[]
  twitterCardTypes: string[]
}

export const MetaDataForm = ({ metaData, updateField, ogTypes, twitterCardTypes }: MetaDataFormProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Asosiy ma'lumotlar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Settings size={16} className="text-indigo-400" />
          Asosiy Ma'lumotlar
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Sahifa Sarlavhasi *</label>
            <Input
              value={metaData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Sahifa sarlavhasini kiriting..."
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Tavsif *</label>
            <Textarea
              value={metaData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Sahifa haqida qisqacha tavsif..."
              className="min-h-[80px] border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Rasm URL</label>
            <Input
              value={metaData.image}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Sahifa URL *</label>
            <Input
              value={metaData.url}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://example.com"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Sayt Nomi</label>
            <Input
              value={metaData.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              placeholder="Sayt nomi"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>
        </div>
      </div>

      {/* Qo'shimcha sozlamalar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Palette size={16} className="text-purple-400" />
          Qo'shimcha Sozlamalar
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Kontent Turi</label>
            <Select value={metaData.type} onValueChange={(value) => updateField('type', value)}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ogTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Til/Hudud</label>
            <Input
              value={metaData.locale}
              onChange={(e) => updateField('locale', e.target.value)}
              placeholder="uz_UZ"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Twitter Kart</label>
            <Select value={metaData.twitterCard} onValueChange={(value) => updateField('twitterCard', value)}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {twitterCardTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Twitter Sayt</label>
            <Input
              value={metaData.twitterSite}
              onChange={(e) => updateField('twitterSite', e.target.value)}
              placeholder="@sayt_nomi"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Twitter Muallif</label>
            <Input
              value={metaData.twitterCreator}
              onChange={(e) => updateField('twitterCreator', e.target.value)}
              placeholder="@muallif_nomi"
              className="border-zinc-700 bg-zinc-800/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
