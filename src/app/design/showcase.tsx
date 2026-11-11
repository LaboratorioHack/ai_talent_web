"use client";

import { useState, type ReactNode } from "react";
import { useToday } from "@/shared/hooks/use-today";
import { CalendarPlus, FileText, Plug, Trash2, Upload, X } from "lucide-react";
import {
  Avatar,
  Button,
  Calendar,
  DateField,
  EmptyState,
  Logo,
  Modal,
  NumberField,
  SearchField,
  SelectField,
  StatusChip,
  Steps,
  ProgressSegments,
  Tabs,
  TextField,
  Toggle,
  useToast,
  type EvaluationStatus,
} from "@/shared/components/ui";

const STATUSES: EvaluationStatus[] = ["meets", "partial", "does_not_meet", "evaluating", "unevaluated", "discarded"];

const PALETTE: { name: string; token: string }[] = [
  { name: "Fondo", token: "bg-bg" },
  { name: "Selección", token: "bg-surface-2" },
  { name: "Línea", token: "bg-border" },
  { name: "Tinta", token: "bg-ink" },
  { name: "Tinta 2", token: "bg-ink-2" },
  { name: "Tinta 3", token: "bg-ink-3" },
  { name: "Azul", token: "bg-blue" },
  { name: "Azul suave", token: "bg-blue-soft" },
  { name: "Cumple", token: "bg-success" },
  { name: "Parcial", token: "bg-warning" },
  { name: "No cumple", token: "bg-danger" },
  { name: "Ámbar", token: "bg-amber" },
];

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <h2 className="font-head text-2xl font-semibold">{title}</h2>
        <p className="max-w-3xl text-sm text-ink-2">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function DesignShowcase() {
  const { toast } = useToast();
  const today = useToday();
  const [tab, setTab] = useState<"all" | "meets" | "partial" | "no">("all");
  const [date, setDate] = useState<Date | null>(new Date(2026, 10, 30));
  const [count, setCount] = useState(2);
  const [ignore, setIgnore] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-14 px-16 py-14">
      <Section
        title="Criba"
        description="Funnel Display en títulos y cifras; Funnel Sans en el cuerpo; IBM Plex Mono para datos verificables. Ámbar como único acento de interfaz; verde, ámbar y rojo solo para resultados."
      >
        <div className="flex items-center gap-8">
          <Logo />
          <span className="rounded-md bg-panel px-3 py-2">
            <Logo inverse />
          </span>
          <Logo compact />
        </div>
        <div className="flex flex-wrap items-baseline gap-12">
          <span className="font-head text-4xl font-semibold">Ingeniero Cloud Senior</span>
          <span className="font-head text-2xl font-semibold">Sección</span>
          <span className="text-base">Texto de cuerpo 14 / 1.5</span>
          <span className="text-sm text-ink-2">Secundario 13</span>
          <span className="font-mono text-xs text-blue">CV pág. 2 · 2022–2025</span>
          <span className="eyebrow">Paso 2 de 4</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {PALETTE.map((c) => (
            <div key={c.name} className="flex w-24 flex-col gap-1.5">
              <span className={`h-10 rounded border border-border ${c.token}`} />
              <span className="text-[11px] text-ink-2">{c.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Botones"
        description="Uno de tinta por pantalla (la acción principal). Contorno para acciones secundarias, texto para salidas suaves, rojo solo para destruir."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button icon={<CalendarPlus />}>Invitar a entrevista</Button>
          <Button variant="outline" icon={<FileText />}>
            Abrir hoja de vida
          </Button>
          <Button variant="text" icon={<X />}>
            Descartar con motivo
          </Button>
          <Button variant="danger" icon={<Trash2 />}>
            Eliminar vacante
          </Button>
          <Button variant="blue" icon={<Plug />}>
            Conectar
          </Button>
          <Button disabled>Tinta deshabilitado</Button>
          <Button variant="outline" loading>
            Cargando
          </Button>
          <Button size="sm" variant="outline">
            Pequeño
          </Button>
          <Button size="lg">Grande</Button>
        </div>
      </Section>

      <Section title="Estados de evaluación" description="Tres resultados posibles y dos estados de proceso. Siempre texto + color, nunca solo color.">
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <StatusChip key={s} status={s} />
          ))}
          <StatusChip status="meets">Cumple · 4 de 4 obligatorios</StatusChip>
          <StatusChip status="partial" size="sm" />
        </div>
      </Section>

      <Section
        title="Campos"
        description="Cada campo dice si es texto libre o se elige de una lista. Los selectores no dejan escribir; los numéricos solo aceptan cifras dentro del rango."
      >
        <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <TextField label="Nombre de la vacante" defaultValue="Ingeniero Cloud Senior" help="Máximo 80 caracteres" maxLength={80} />
          <SelectField
            label="Área"
            defaultValue="tech"
            help="No se puede escribir; elige una opción"
            options={[
              { value: "tech", label: "Tecnología" },
              { value: "data", label: "Datos" },
              { value: "product", label: "Producto" },
            ]}
          />
          <DateField label="Cierre de postulaciones" value={date} onChange={setDate} minDate={today ?? undefined} help="Solo fechas futuras" />
          <NumberField label="Número de vacantes" value={count} onChange={setCount} min={1} max={50} />
        </div>
        <div className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField label="Correo" defaultValue="ana@bancolombia" error="Escribe un correo válido" />
          <TextField label="Correo" placeholder="nombre@empresa.com" />
          <SelectField label="Rol" options={[{ value: "r", label: "Reclutador" }]} defaultValue="r" disabled />
          <TextField label="Correo" defaultValue="ana.m@bancolombia.com" validated />
          <SearchField shortcut="⌘K" />
        </div>
      </Section>

      <Section
        title="Selectores"
        description="Calendario para fechas, interruptor para opciones binarias, pasos para procesos largos, pestañas para vistas hermanas."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Calendar value={date} onChange={setDate} minDate={today ?? undefined} />
          <div className="flex flex-col gap-7">
            <Toggle checked={ignore} onChange={setIgnore} label="Ignorar foto y datos personales" />
            <Toggle checked={false} onChange={() => undefined} label="Entrevista IA automática" description="Se envía al cumplir el perfil" />
            <Steps steps={["Cuenta", "Organización", "Fuentes", "Primera vacante"]} current={0} />
            <ProgressSegments total={4} current={0} className="w-80" />
            <Tabs
              aria-label="Filtro de candidatos"
              value={tab}
              onChange={setTab}
              items={[
                { value: "all", label: "Todos", count: 84 },
                { value: "meets", label: "Cumplen", count: 12 },
                { value: "partial", label: "Parciales", count: 31 },
                { value: "no", label: "No cumplen", count: 41 },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Avisos y salidas"
        description="Toasts para confirmar acciones; modales solo cuando hay que decidir o justificar. Siempre hay una salida clara."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Invitación enviada a D. Osorio",
                description: "Recibirá el enlace de la entrevista por correo.",
                action: { label: "Deshacer", onClick: () => undefined },
              })
            }
          >
            Toast éxito
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "error", title: "No se pudo conectar con Greenhouse", description: "401 · token vencido" })}>
            Toast error
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "progress", title: "Evaluando 84 hojas de vida", description: "52 de 84 · quedan ~1 min", duration: 4000 })}>
            Toast proceso
          </Button>
          <Button variant="text" icon={<X />} onClick={() => setModalOpen(true)}>
            Abrir modal Descartar
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Descartar a J. Rivas"
          description="El motivo queda en la auditoría y lo ve el candidato si lo pide."
          footer={
            <>
              <Button variant="text" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" disabled={!reason} onClick={() => setModalOpen(false)}>
                Descartar
              </Button>
            </>
          }
        >
          <SelectField
            label="Motivo"
            placeholder="Elige un motivo"
            value={reason}
            onChange={setReason}
            options={[
              { value: "mandatory", label: "No cumple un obligatorio" },
              { value: "disqualifying", label: "Tiene un descalificante" },
              { value: "other", label: "Otro" },
            ]}
          />
        </Modal>
      </Section>

      <Section title="Archivos y vacíos" description="Los vacíos siempre proponen el siguiente paso. Los avatares usan iniciales: Criba nunca muestra la foto.">
        <div className="flex flex-wrap items-start gap-10">
          <EmptyState
            title="Todavía no hay candidatos"
            description="Sube hojas de vida o conecta tu ATS para empezar."
            action={<Button icon={<Upload />}>Subir hojas de vida</Button>}
            alternative="o conectar Greenhouse / Lever"
            className="w-[400px]"
          />
          <div className="flex items-center gap-3">
            <Avatar name="Daniela Osorio" />
            <Avatar name="Julián Ríos" size={32} />
            <Avatar name="Sebastián Vega" size={72} />
          </div>
        </div>
      </Section>
    </main>
  );
}
