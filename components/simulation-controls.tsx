"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react"

interface SimulationControlsProps {
  isPlaying: boolean
  currentTime: number
  timeRange: [number, number]
  onPlay: () => void
  onReset: () => void
  onTimeChange: (time: number) => void
}

export function SimulationControls({
  isPlaying,
  currentTime,
  timeRange,
  onPlay,
  onReset,
  onTimeChange,
}: SimulationControlsProps) {
  const [minTime, maxTime] = timeRange

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Controles de Simulación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onTimeChange(minTime)}>
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button onClick={onPlay} size="sm" className="px-4">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={() => onTimeChange(maxTime)}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minTime.toFixed(1)}s</span>
            <span className="font-mono">{currentTime.toFixed(2)}s</span>
            <span>{maxTime.toFixed(1)}s</span>
          </div>

          <Slider
            value={[currentTime]}
            onValueChange={([value]) => onTimeChange(value)}
            min={minTime}
            max={maxTime}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Velocidad de Reproducción</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">0.5x</span>
            <Slider defaultValue={[1]} min={0.1} max={3} step={0.1} className="flex-1" />
            <span className="text-xs text-muted-foreground">3x</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
