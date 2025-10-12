"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Cable as Cube, Settings } from "lucide-react"

interface ObjectInspectorProps {
  object: any
  onClose: () => void
}

export function ObjectInspector({ object, onClose }: ObjectInspectorProps) {
  if (!object) return null

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "mass":
        return "⚫"
      case "spring":
        return "🌀"
      case "cylinder":
        return "🔵"
      default:
        return "📦"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cube className="h-4 w-4" />
            Inspector de Objeto
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Object Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getObjectIcon(object.type)}</span>
            <div>
              <p className="font-medium text-sm">{object.id}</p>
              <Badge variant="secondary" className="text-xs">
                {object.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Propiedades</h4>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posición:</span>
              <span className="font-mono">[{object.position?.map((p: number) => p.toFixed(2)).join(", ")}]</span>
            </div>

            {object.mass && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Masa:</span>
                <span className="font-mono">{object.mass} kg</span>
              </div>
            )}

            {object.stiffness && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rigidez:</span>
                <span className="font-mono">{object.stiffness} N/m</span>
              </div>
            )}

            {object.radius && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Radio:</span>
                <span className="font-mono">{object.radius} m</span>
              </div>
            )}

            {object.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Altura:</span>
                <span className="font-mono">{object.height} m</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Editar Propiedades
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
