import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Settings, RefreshCw } from "lucide-react";

// Definimos los tipos para los parámetros y las props del componente
type Parameters = {
  mass: number;
  stiffness: number;
};

type ParameterControlsProps = {
  parameters: Parameters;
  onParametersChange: (newParams: Parameters) => void;
  onResimulate: () => void;
  isSimulating: boolean;
  disabled: boolean;
};

export function ParameterControls({
  parameters,
  onParametersChange,
  onResimulate,
  isSimulating,
  disabled
}: ParameterControlsProps) {

  // Función genérica para manejar cambios en los inputs
  const handleInputChange = (param: keyof Parameters, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onParametersChange({ ...parameters, [param]: numValue });
    }
  };

  // Función genérica para manejar cambios en los sliders
  const handleSliderChange = (param: keyof Parameters, value: number[]) => {
    onParametersChange({ ...parameters, [param]: value[0] });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Parámetros de Simulación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* --- Parámetro de Masa --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="mass" className="text-xs font-medium">Masa (kg)</label>
            <Input
              id="mass"
              type="number"
              className="w-20 h-7"
              value={parameters.mass}
              onChange={(e) => handleInputChange('mass', e.target.value)}
              disabled={disabled}
            />
          </div>
          <Slider
            value={[parameters.mass]}
            onValueChange={(value) => handleSliderChange('mass', value)}
            min={0.1}
            max={10}
            step={0.1}
            disabled={disabled}
          />
        </div>

        {/* --- Parámetro de Rigidez --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="stiffness" className="text-xs font-medium">Rigidez (N/m)</label>
            <Input
              id="stiffness"
              type="number"
              className="w-20 h-7"
              value={parameters.stiffness}
              onChange={(e) => handleInputChange('stiffness', e.target.value)}
              disabled={disabled}
            />
          </div>
          <Slider
            value={[parameters.stiffness]}
            onValueChange={(value) => handleSliderChange('stiffness', value)}
            min={-10}
            max={10}
            step={0.2}
            disabled={disabled}
          />
        </div>

        {/* --- Botón para Re-simular --- */}
        <Button 
          className="w-full" 
          onClick={onResimulate} 
          disabled={disabled || isSimulating}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Simulando...
            </>
          ) : (
            "Aplicar y Re-simular"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}