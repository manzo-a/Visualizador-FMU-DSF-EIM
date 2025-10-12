import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCandlestick } from "lucide-react";

// Tipos para nuestros datos y props
type DataPoint = { time: number; [key: string]: number; };
type RealTimeChartProps = {
  data: DataPoint[];
  variables: string[];
  currentTime: number;
};

// Paleta de colores para las líneas del gráfico
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

export function RealTimeChart({ data, variables, currentTime }: RealTimeChartProps) {
  // Encontramos el punto de datos actual para el ReferenceDot
  const currentPoint = data.find(p => p.time >= currentTime) || data[data.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ChartCandlestick className="h-4 w-4" />
          Gráfico de Variables
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ResponsiveContainer hace que el gráfico ocupe el 100% de su contenedor padre */}
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="time" type="number" domain={[0, 'dataMax']} unit="s" allowDataOverflow={true}/>
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelFormatter={(label) => `Tiempo: ${label.toFixed(2)}s`}
            />
            <Legend />
            {/* Mapeamos las variables seleccionadas para crear una <Line> para cada una */}
            {variables.map((variable, index) => (
              <Line
                key={variable}
                type="monotone"
                dataKey={variable}
                stroke={COLORS[index % COLORS.length]} // Asigna un color de la paleta
                dot={false}
                strokeWidth={2}
              />
            ))}
            {/* Este es el punto que se mueve en tiempo real */}
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.time}
                y={currentPoint[variables[0]]} // Se posiciona en la primera variable seleccionada
                r={5}
                fill={COLORS[0]}
                stroke="white"
                isFront={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}