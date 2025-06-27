import { Palette, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ColorPreset {
  name: string
  color: string
  category: string
}

interface ColorPickerPanelProps {
  inputColor: string
  colorPresets: ColorPreset[]
  setInputColor: (color: string) => void
  handleRandomColor: () => void
}

export const ColorPickerPanel = ({
  inputColor,
  colorPresets,
  setInputColor,
  handleRandomColor,
}: ColorPickerPanelProps) => {
  return (
    <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Color Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">HEX rang kodi:</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              placeholder="#000000"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
            />
            <Button onClick={handleRandomColor} variant="outline" size="sm">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Vizual rang tanlash:</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className="h-12 w-20 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800"
            />
            <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div className="text-sm text-zinc-300">Joriy rang:</div>
              <div className="font-mono text-lg text-zinc-100">{inputColor}</div>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Rang namoyishi:</label>
          <div className="h-24 w-full rounded-lg border border-zinc-700" style={{ backgroundColor: inputColor }} />
        </div>

        {/* Preset Colors */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Tayyor ranglar:</label>
          <div className="grid grid-cols-8 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setInputColor(preset.color)}
                className={`h-8 w-8 rounded border-2 transition-all hover:scale-110 ${
                  inputColor.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-zinc-400 ring-2 ring-zinc-400'
                    : 'border-zinc-600 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: preset.color }}
                title={`${preset.name} (${preset.color})`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
