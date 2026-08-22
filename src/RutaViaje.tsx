import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL VIAJE
|--------------------------------------------------------------------------
*/

const VIAJE = {
  fechaInicio: "17/09/2026",
  velocidadPromedio: 110,
  autonomia: 300,
  horaSalida: "06:00",
  horaFin: "17:00",
};

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

type Punto = {
  nombre: string;
  lat: number;
  lng: number;
  tipo:
    | "inicio"
    | "fin"
    | "ciudad"
    | "pueblo"
    | "combustible"
    | "frontera"
    | "paso"
    | "alerta";
  dia?: number;
  descripcion?: string;
  bandera?: string;
};

type RutaDia = {
  dia: number;
  fecha: string;
  titulo: string;
  color: string;
  puntos: Punto[];
};

/*
|--------------------------------------------------------------------------
| PUNTOS PRINCIPALES
|--------------------------------------------------------------------------
*/

const PUNTOS: Punto[] = [
  /*
  ------------------------------------------------------------------------
  DÍA 1
  Pueblo Andino → Mendoza
  ------------------------------------------------------------------------
  */

  {
    nombre: "Pueblo Andino",
    lat: -32.669,
    lng: -60.887,
    tipo: "inicio",
    dia: 1,
    descripcion: "Salida del viaje",
  },

  {
    nombre: "Rosario",
    lat: -32.9468,
    lng: -60.6393,
    tipo: "ciudad",
    dia: 1,
  },

  {
    nombre: "Venado Tuerto",
    lat: -33.7456,
    lng: -61.9688,
    tipo: "ciudad",
    dia: 1,
  },

  {
    nombre: "Rufino",
    lat: -34.267,
    lng: -62.712,
    tipo: "pueblo",
    dia: 1,
    descripcion: "Primera parada recomendable de combustible",
  },

  {
    nombre: "Laboulaye",
    lat: -34.126,
    lng: -63.391,
    tipo: "ciudad",
    dia: 1,
  },

  {
    nombre: "Villa Mercedes",
    lat: -33.6757,
    lng: -65.4578,
    tipo: "ciudad",
    dia: 1,
    descripcion: "Parada importante para combustible",
  },

  {
    nombre: "La Paz",
    lat: -33.460,
    lng: -67.550,
    tipo: "pueblo",
    dia: 1,
  },

  {
    nombre: "Mendoza Capital",
    lat: -32.8895,
    lng: -68.8458,
    tipo: "fin",
    dia: 1,
    descripcion: "Fin del Día 1",
  },

  /*
  ------------------------------------------------------------------------
  DÍA 2
  Mendoza → Cristo Redentor → Chile → Santiago
  ------------------------------------------------------------------------
  */

  {
    nombre: "Uspallata",
    lat: -32.592,
    lng: -69.347,
    tipo: "pueblo",
    dia: 2,
    descripcion: "Último punto importante antes de alta montaña",
  },

  {
    nombre: "Las Cuevas",
    lat: -32.825,
    lng: -70.047,
    tipo: "pueblo",
    dia: 2,
  },

  {
    nombre: "Paso Cristo Redentor",
    lat: -32.824,
    lng: -70.064,
    tipo: "frontera",
    dia: 2,
    descripcion:
      "Paso internacional Argentina-Chile. Controlar apertura por nieve.",
  },

  {
    nombre: "Los Andes",
    lat: -32.833,
    lng: -70.598,
    tipo: "ciudad",
    dia: 2,
  },

  {
    nombre: "Santiago de Chile",
    lat: -33.4489,
    lng: -70.6693,
    tipo: "fin",
    dia: 2,
    descripcion: "Destino recomendado para finalizar el Día 2",
  },

  /*
  ------------------------------------------------------------------------
  DÍA 3
  Santiago → La Serena
  ------------------------------------------------------------------------
  */

  {
    nombre: "Santiago de Chile",
    lat: -33.4489,
    lng: -70.6693,
    tipo: "inicio",
    dia: 3,
  },

  {
    nombre: "Los Vilos",
    lat: -31.912,
    lng: -71.504,
    tipo: "ciudad",
    dia: 3,
  },

  {
    nombre: "Ovalle",
    lat: -30.601,
    lng: -71.199,
    tipo: "ciudad",
    dia: 3,
  },

  {
    nombre: "La Serena",
    lat: -29.9027,
    lng: -71.2519,
    tipo: "fin",
    dia: 3,
    descripcion:
      "Parada recomendada para finalizar la jornada antes de intentar Agua Negra.",
  },

  /*
  ------------------------------------------------------------------------
  DÍA 4 - OPCIÓN AGUA NEGRA
  ------------------------------------------------------------------------
  */

  {
    nombre: "Vicuña",
    lat: -30.031,
    lng: -70.708,
    tipo: "pueblo",
    dia: 4,
  },

  {
    nombre: "Paso Agua Negra",
    lat: -30.36,
    lng: -69.82,
    tipo: "frontera",
    dia: 4,
    descripcion:
      "ALERTA: actualmente figura cerrado de junio a octubre. Verificar nuevamente antes de viajar.",
  },

  {
    nombre: "Las Flores",
    lat: -30.16,
    lng: -69.16,
    tipo: "pueblo",
    dia: 4,
  },

  {
    nombre: "San José de Jáchal",
    lat: -30.241,
    lng: -68.746,
    tipo: "ciudad",
    dia: 4,
  },

  {
    nombre: "San Juan",
    lat: -31.5375,
    lng: -68.5364,
    tipo: "ciudad",
    dia: 4,
  },

  /*
  ------------------------------------------------------------------------
  DÍA 4 - ALTERNATIVA SICO
  ------------------------------------------------------------------------
  */

  {
    nombre: "San Pedro de Atacama",
    lat: -22.9087,
    lng: -68.1997,
    tipo: "ciudad",
    dia: 4,
    descripcion: "Alternativa hacia Paso Sico",
  },

  {
    nombre: "Paso Sico",
    lat: -23.870,
    lng: -67.182,
    tipo: "frontera",
    dia: 4,
    descripcion:
      "Alternativa de cruce Argentina-Chile. Verificar estado oficial antes de salir.",
  },

  {
    nombre: "San Antonio de los Cobres",
    lat: -24.221,
    lng: -66.319,
    tipo: "pueblo",
    dia: 4,
    descripcion: "Entrada a Argentina por RN51",
  },

  {
    nombre: "Salta",
    lat: -24.7821,
    lng: -65.4232,
    tipo: "fin",
    dia: 4,
    descripcion:
      "Destino recomendado si se utiliza la alternativa por Paso Sico.",
  },
];

/*
|--------------------------------------------------------------------------
| ESTACIONES DE COMBUSTIBLE
|--------------------------------------------------------------------------
*/

const ESTACIONES: Punto[] = [
  {
    nombre: "YPF Rosario",
    lat: -32.947,
    lng: -60.64,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },
  {
    nombre: "YPF Venado Tuerto",
    lat: -33.745,
    lng: -61.968,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },
  {
    nombre: "YPF Rufino",
    lat: -34.267,
    lng: -62.712,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },
  {
    nombre: "YPF Laboulaye",
    lat: -34.126,
    lng: -63.391,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },
  {
    nombre: "YPF Villa Mercedes",
    lat: -33.6757,
    lng: -65.4578,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },
  {
    nombre: "YPF Mendoza",
    lat: -32.8895,
    lng: -68.8458,
    tipo: "combustible",
    dia: 1,
    bandera: "YPF",
  },

  {
    nombre: "Combustible Uspallata",
    lat: -32.592,
    lng: -69.347,
    tipo: "combustible",
    dia: 2,
    bandera: "Varias",
  },

  {
    nombre: "Copec Los Andes",
    lat: -32.833,
    lng: -70.598,
    tipo: "combustible",
    dia: 2,
    bandera: "COPEC",
  },

  {
    nombre: "Copec Santiago",
    lat: -33.4489,
    lng: -70.6693,
    tipo: "combustible",
    dia: 2,
    bandera: "COPEC",
  },

  {
    nombre: "Copec Los Vilos",
    lat: -31.912,
    lng: -71.504,
    tipo: "combustible",
    dia: 3,
    bandera: "COPEC",
  },

  {
    nombre: "Copec Ovalle",
    lat: -30.601,
    lng: -71.199,
    tipo: "combustible",
    dia: 3,
    bandera: "COPEC",
  },

  {
    nombre: "Copec La Serena",
    lat: -29.9027,
    lng: -71.2519,
    tipo: "combustible",
    dia: 3,
    bandera: "COPEC",
  },

  {
    nombre: "Combustible Vicuña",
    lat: -30.031,
    lng: -70.708,
    tipo: "combustible",
    dia: 4,
    bandera: "Varias",
  },

  {
    nombre: "Combustible San José de Jáchal",
    lat: -30.241,
    lng: -68.746,
    tipo: "combustible",
    dia: 4,
    bandera: "YPF",
  },

  {
    nombre: "YPF San Juan",
    lat: -31.5375,
    lng: -68.5364,
    tipo: "combustible",
    dia: 4,
    bandera: "YPF",
  },

  {
    nombre: "Combustible San Antonio de los Cobres",
    lat: -24.221,
    lng: -66.319,
    tipo: "combustible",
    dia: 4,
    bandera: "YPF / otras",
  },

  {
    nombre: "YPF Salta",
    lat: -24.7821,
    lng: -65.4232,
    tipo: "combustible",
    dia: 4,
    bandera: "YPF",
  },
];

/*
|--------------------------------------------------------------------------
| RUTAS
|--------------------------------------------------------------------------
*/

const RUTAS: RutaDia[] = [
  {
    dia: 1,
    fecha: "17/09/2026",
    titulo: "Pueblo Andino → Mendoza",
    color: "#f59e0b",
    puntos: PUNTOS.filter((p) => p.dia === 1),
  },
  {
    dia: 2,
    fecha: "18/09/2026",
    titulo: "Mendoza → Cristo Redentor → Santiago",
    color: "#22c55e",
    puntos: PUNTOS.filter((p) => p.dia === 2),
  },
  {
    dia: 3,
    fecha: "19/09/2026",
    titulo: "Santiago → La Serena",
    color: "#38bdf8",
    puntos: PUNTOS.filter((p) => p.dia === 3),
  },
  {
    dia: 4,
    fecha: "20/09/2026",
    titulo: "Chile → Argentina",
    color: "#a855f7",
    puntos: PUNTOS.filter((p) => p.dia === 4),
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function distanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatoKm(km: number) {
  return `${Math.round(km)} km`;
}

function iconoPorTipo(tipo: Punto["tipo"]) {
  switch (tipo) {
    case "inicio":
      return "🏁";

    case "fin":
      return "🏆";

    case "combustible":
      return "⛽";

    case "frontera":
      return "🛂";

    case "paso":
      return "🏔️";

    case "alerta":
      return "⚠️";

    case "ciudad":
      return "🏙️";

    case "pueblo":
      return "📍";

    default:
      return "📍";
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

export default function RutaViajeMoto() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  const [diaActivo, setDiaActivo] = useState(1);

  /*
  ------------------------------------------------------------------------
  | Inicializar Leaflet
  ------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Configurar icono por defecto apuntando al CDN de Leaflet
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      preferCanvas: true,
    });

    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);

    map.setView([-32.5, -65.5], 6);

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapInstance.current = null;
      layersRef.current = null;
    };
  }, []);

  /*
  ------------------------------------------------------------------------
  | Dibujar puntos
  ------------------------------------------------------------------------
  */

  useEffect(() => {
    const map = mapInstance.current;
    const layers = layersRef.current;

    if (!map || !layers) return;

    layers.clearLayers();

    const ruta = RUTAS.find((r) => r.dia === diaActivo);

    if (!ruta) return;

    const coordenadas = ruta.puntos.map(
      (p) => [p.lat, p.lng] as [number, number]
    );

    const polyline = L.polyline(coordenadas, {
      color: ruta.color,
      weight: 6,
      opacity: 0.9,
    });

    polyline.addTo(layers);

    ruta.puntos.forEach((punto) => {
      const emoji = iconoPorTipo(punto.tipo);

      const marker = L.marker([punto.lat, punto.lng]);

      marker.bindPopup(`
        <div style="
          min-width:220px;
          font-family:Arial,sans-serif;
        ">
          <div style="
            font-size:24px;
            margin-bottom:5px;
          ">
            ${emoji}
          </div>

          <strong style="
            font-size:17px;
          ">
            ${punto.nombre}
          </strong>

          ${
            punto.descripcion
              ? `
                <p style="
                  margin:8px 0 0;
                  color:#475569;
                ">
                  ${punto.descripcion}
                </p>
              `
              : ""
          }

          ${
            punto.bandera
              ? `
                <div style="
                  margin-top:8px;
                  padding:5px 8px;
                  background:#f1f5f9;
                  border-radius:5px;
                ">
                  ⛽ ${punto.bandera}
                </div>
              `
              : ""
          }
        </div>
      `);

      marker.addTo(layers);
    });

    ESTACIONES.filter((e) => e.dia === diaActivo).forEach((estacion) => {
      const fuelIcon = L.divIcon({
        className: "fuel-marker",
        html: `
          <div style="
            width:36px;
            height:36px;
            border-radius:50%;
            background:#dc2626;
            color:white;
            display:flex;
            align-items:center;
            justify-content:center;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.5);
            font-size:18px;
          ">
            ⛽
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(
        [estacion.lat, estacion.lng],
        {
          icon: fuelIcon,
        }
      );

      marker.bindPopup(`
        <div style="font-family:Arial">
          <strong>${estacion.nombre}</strong>
          <br/>
          <span>⛽ ${estacion.bandera || "Combustible"}</span>
        </div>
      `);

      marker.addTo(layers);
    });

    if (coordenadas.length > 1) {
      map.fitBounds(polyline.getBounds(), {
        padding: [40, 40],
      });
    }
  }, [diaActivo]);

  /*
  ------------------------------------------------------------------------
  | Cálculo de distancias aproximadas
  ------------------------------------------------------------------------
  */

  const resumenDias = useMemo(() => {
    return RUTAS.map((ruta) => {
      let total = 0;

      for (let i = 1; i < ruta.puntos.length; i++) {
        total += distanciaHaversine(
          ruta.puntos[i - 1].lat,
          ruta.puntos[i - 1].lng,
          ruta.puntos[i].lat,
          ruta.puntos[i].lng
        );
      }

      const horas =
        total / VIAJE.velocidadPromedio;

      return {
        ...ruta,
        km: total,
        horas,
      };
    });
  }, []);

  /*
  ------------------------------------------------------------------------
  | Cálculo combustible
  ------------------------------------------------------------------------
  */

  function calcularTramosCombustible(ruta: RutaDia) {
    const estaciones = ESTACIONES.filter(
      (e) => e.dia === ruta.dia
    );

    const resultados: {
      desde: string;
      hasta: string;
      km: number;
      alerta: boolean;
    }[] = [];

    let ultimoPunto = ruta.puntos[0];

    estaciones.forEach((estacion) => {
      const km = distanciaHaversine(
        ultimoPunto.lat,
        ultimoPunto.lng,
        estacion.lat,
        estacion.lng
      );

      resultados.push({
        desde: ultimoPunto.nombre,
        hasta: estacion.nombre,
        km,
        alerta: km > VIAJE.autonomia,
      });

      ultimoPunto = estacion;
    });

    return resultados;
  }

  const diaSeleccionado = resumenDias.find(
    (d) => d.dia === diaActivo
  );

  /*
  ------------------------------------------------------------------------
  | Imprimir
  ------------------------------------------------------------------------
  */

  function imprimirRuta() {
    window.print();
  }

  return (
    <div className="ruta-app">

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #020617;
        }

        .ruta-app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top,
              #172033 0%,
              #020617 55%
            );
          color: #e2e8f0;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          padding: 20px;
        }

        .header {
          max-width: 1500px;
          margin: 0 auto 20px;
          padding: 22px;
          border: 1px solid #334155;
          border-radius: 18px;
          background: rgba(15,23,42,.9);
          box-shadow: 0 20px 50px rgba(0,0,0,.35);
        }

        .title {
          margin: 0;
          color: #fbbf24;
          font-size: clamp(25px,4vw,42px);
          font-weight: 900;
          letter-spacing: -1px;
        }

        .subtitle {
          margin-top: 8px;
          color: #94a3b8;
        }

        .warning {
          margin-top: 16px;
          padding: 15px;
          border-radius: 12px;
          background: #451a03;
          border: 1px solid #f59e0b;
          color: #fde68a;
          line-height: 1.5;
        }

        .controls {
          max-width: 1500px;
          margin: 0 auto 15px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .day-button {
          border: 1px solid #475569;
          color: #cbd5e1;
          background: #0f172a;
          border-radius: 10px;
          padding: 11px 15px;
          cursor: pointer;
          font-weight: 700;
        }

        .day-button.active {
          background: #f59e0b;
          color: #111827;
          border-color: #f59e0b;
        }

        .print-button {
          margin-left: auto;
          border: 0;
          border-radius: 10px;
          padding: 11px 18px;
          background: #22c55e;
          color: #052e16;
          font-weight: 900;
          cursor: pointer;
        }

        .content {
          max-width: 1500px;
          margin: auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 18px;
        }

        .map-card {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 18px;
          padding: 10px;
          overflow: hidden;
        }

        .map {
          width: 100%;
          height: 720px;
          border-radius: 12px;
          overflow: hidden;
        }

        .panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 18px;
        }

        .card h2 {
          margin: 0 0 12px;
          color: #f8fafc;
          font-size: 20px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #1e293b;
        }

        .stat:last-child {
          border-bottom: 0;
        }

        .stat span:first-child {
          color: #94a3b8;
        }

        .stat strong {
          color: #f8fafc;
        }

        .route-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .route-item {
          padding: 9px 10px;
          background: #111c31;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }

        .fuel-item {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 7px;
          background: #111c31;
        }

        .fuel-danger {
          border: 1px solid #ef4444;
          background: #450a0a;
        }

        .small {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .official {
          margin-top: 10px;
          color: #38bdf8;
          font-size: 13px;
        }

        @media (max-width: 1050px) {
          .content {
            grid-template-columns: 1fr;
          }

          .map {
            height: 600px;
          }

          .print-button {
            margin-left: 0;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            background: white !important;
          }

          .ruta-app {
            background: white !important;
            color: black !important;
            padding: 0;
          }

          .header,
          .card,
          .map-card {
            background: white !important;
            color: black !important;
            border: 1px solid #999 !important;
            box-shadow: none !important;
          }

          .header {
            padding: 10px;
          }

          .title {
            color: black !important;
            font-size: 24px;
          }

          .subtitle,
          .small,
          .stat span:first-child {
            color: #444 !important;
          }

          .controls {
            display: none !important;
          }

          .content {
            display: grid !important;
            grid-template-columns: 1fr 300px !important;
          }

          .map {
            height: 520px !important;
          }

          .warning {
            background: #fff7ed !important;
            color: #7c2d12 !important;
            border: 1px solid #fb923c !important;
          }

          .leaflet-control-container {
            display: none !important;
          }
        }
      `}</style>

      <header className="header">
        <h1 className="title">
          🏍️ ROADMAP EXPEDICIÓN ANDINO → CHILE
        </h1>

        <div className="subtitle">
          Viaje en motocicleta · 17 al 20 de septiembre de 2026
        </div>

        <div className="warning">
          <strong>⚠️ ATENCIÓN CON AGUA NEGRA</strong>
          <br />
          La información oficial consultada actualmente indica
          que el Paso Agua Negra permanece cerrado durante junio,
          julio, agosto, septiembre y octubre. No lo tomen como
          paso confirmado para este viaje: deberán volver a
          comprobar el estado oficial pocos días antes de salir.
        </div>
      </header>

      <div className="controls">
        {RUTAS.map((ruta) => (
          <button
            key={ruta.dia}
            className={
              diaActivo === ruta.dia
                ? "day-button active"
                : "day-button"
            }
            onClick={() => setDiaActivo(ruta.dia)}
          >
            Día {ruta.dia} · {ruta.fecha}
          </button>
        ))}

        <button
          className="print-button"
          onClick={imprimirRuta}
        >
          🖨️ IMPRIMIR MAPA
        </button>
      </div>

      <main className="content">

        <section className="map-card">
          <div
            ref={mapRef}
            className="map"
          />
        </section>

        <aside className="panel">

          <section className="card">
            <h2>
              Día {diaActivo}
            </h2>

            <div className="small">
              {diaSeleccionado?.titulo}
            </div>

            <div style={{ marginTop: 15 }}>
              <div className="stat">
                <span>Fecha</span>
                <strong>
                  {diaSeleccionado?.fecha}
                </strong>
              </div>

              <div className="stat">
                <span>Distancia aprox.</span>
                <strong>
                  {formatoKm(diaSeleccionado?.km || 0)}
                </strong>
              </div>

              <div className="stat">
                <span>Velocidad de cálculo</span>
                <strong>
                  {VIAJE.velocidadPromedio} km/h
                </strong>
              </div>

              <div className="stat">
                <span>Autonomía máxima</span>
                <strong>
                  {VIAJE.autonomia} km
                </strong>
              </div>
            </div>
          </section>

          <section className="card">
            <h2>📍 Recorrido</h2>

            <div className="route-list">
              {diaSeleccionado?.puntos.map(
                (punto, index) => (
                  <div
                    key={`${punto.nombre}-${index}`}
                    className="route-item"
                  >
                    {iconoPorTipo(punto.tipo)}{" "}
                    <strong>{punto.nombre}</strong>

                    {punto.descripcion && (
                      <div className="small">
                        {punto.descripcion}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </section>

          <section className="card">
            <h2>⛽ Combustible</h2>

            <div className="small">
              Se intenta mantener cada tramo por debajo
              de los {VIAJE.autonomia} km.
            </div>

            <div style={{ marginTop: 12 }}>
              {calcularTramosCombustible(
                RUTAS.find(
                  (r) => r.dia === diaActivo
                )!
              ).map((tramo, index) => (
                <div
                  key={index}
                  className={
                    tramo.alerta
                      ? "fuel-item fuel-danger"
                      : "fuel-item"
                  }
                >
                  <strong>
                    {tramo.desde}
                  </strong>

                  <div className="small">
                    ↓ {formatoKm(tramo.km)}
                  </div>

                  <strong>
                    ⛽ {tramo.hasta}
                  </strong>

                  {tramo.alerta && (
                    <div
                      style={{
                        color: "#fca5a5",
                        marginTop: 5,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ⚠️ SUPERA 300 KM
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>🌡️ Clima de septiembre</h2>

            {diaActivo === 1 && (
              <>
                <strong>Mendoza</strong>
                <p className="small">
                  Primavera temprana.
                  <br />
                  Máxima media: ~20 °C
                  <br />
                  Media: ~14 °C
                  <br />
                  Mínima media: ~8 °C
                  <br />
                  En montaña puede hacer mucho más frío.
                </p>
              </>
            )}

            {diaActivo === 2 && (
              <>
                <strong>Alta montaña + Santiago</strong>
                <p className="small">
                  En el sector del Cristo Redentor
                  las temperaturas pueden estar bajo
                  cero, especialmente temprano.
                  Santiago es considerablemente más
                  templado.
                </p>
              </>
            )}

            {diaActivo === 3 && (
              <>
                <strong>Chile central</strong>
                <p className="small">
                  Santiago hacia Los Vilos, Ovalle y
                  La Serena. Temperaturas más suaves
                  al avanzar hacia la costa.
                </p>
              </>
            )}

            {diaActivo === 4 && (
              <>
                <strong>Cordillera / Atacama / Puna</strong>
                <p className="small">
                  Mucha amplitud térmica.
                  Las zonas de gran altura pueden
                  presentar temperaturas bajo cero
                  durante la madrugada.
                </p>
              </>
            )}
          </section>

          <section className="card">
            <h2>🛂 Pasos fronterizos</h2>

            <p className="small">
              <strong>Cristo Redentor:</strong>
              actualmente operativo, pero sujeto a
              cierres por nieve y condiciones de alta
              montaña.
            </p>

            <p className="small">
              <strong>Agua Negra:</strong>
              actualmente informado como cerrado
              entre junio y octubre.
            </p>

            <p className="small">
              <strong>Sico:</strong>
              actualmente figura operativo con horario
              09:00–19:00 y requiere verificar el
              estado de la RN51.
            </p>

            <div className="official">
              ⚠️ Consultar estado oficial antes de cada
              jornada.
            </div>
          </section>

        </aside>

      </main>
    </div>
  );
}