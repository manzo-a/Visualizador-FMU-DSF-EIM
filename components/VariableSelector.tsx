import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

type VariableSelectorProps = {
  availableVariables: string[];
  selectedVariables: string[];
  onSelectionChange: (selected: string[]) => void;
};

export function VariableSelector({
  availableVariables,
  selectedVariables,
  onSelectionChange,
}: VariableSelectorProps) {

  const handleCheckboxChange = (variable: string) => {
    let newSelection: string[];
    if (selectedVariables.includes(variable)) {
      // Si ya está seleccionada, la quitamos
      newSelection = selectedVariables.filter(v => v !== variable);
    } else {
      // Si no está seleccionada, la añadimos
      newSelection = [...selectedVariables, variable];
    }
    onSelectionChange(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Seleccionar Variables a Graficar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
        {availableVariables
          .filter(v => v !== 'time') // Excluimos la variable 'time' de la selección
          .map(variable => (
            <div key={variable} className="flex items-center space-x-2">
              <Checkbox
                id={variable}
                checked={selectedVariables.includes(variable)}
                onCheckedChange={() => handleCheckboxChange(variable)}
              />
              <Label htmlFor={variable} className="text-xs font-normal cursor-pointer">
                {variable}
              </Label>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}