"use client";

import { useState } from "react";
import { CalendarCheck, Trash2 } from "lucide-react";
import { Button, DateField, Modal, SelectField, TextField } from "@/shared/components/ui";
import { useToday } from "@/shared/hooks/use-today";
import { toISODate } from "@/shared/lib/dates";
import { scheduleWithTeam } from "../api/actions";

const HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map((h) => ({ value: h, label: h }));
const DURATIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
];

/** Programar la entrevista con el equipo (humana) después de la de IA. */
export function ScheduleModal({ interviewId, name, open, onClose, onScheduled }: { interviewId: string; name: string; open: boolean; onClose: () => void; onScheduled: (summary: string) => void }) {
  const today = useToday();
  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState("10:00");
  const [duration, setDuration] = useState("45");
  const [guests, setGuests] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const min = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) : undefined;

  async function submit() {
    if (!date) {
      setError("Elige una fecha");
      return;
    }
    const list = guests.split(/[,;\s]+/).map((g) => g.trim()).filter(Boolean);
    if (list.some((g) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g))) {
      setError("Revisa los correos de quienes asisten");
      return;
    }
    setBusy(true);
    try {
      await scheduleWithTeam(interviewId, { date: toISODate(date), time: hour, durationMin: Number(duration), guests: list });
      onScheduled(`${date.getDate()}/${date.getMonth() + 1} a las ${hour}`);
    } catch {
      setError("No se pudo programar. Intenta de nuevo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Programar entrevista con el equipo"
      description={`${name} recibirá la invitación con el enlace de la reunión. Le compartimos los puntos a validar al equipo.`}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button icon={<CalendarCheck />} loading={busy} onClick={submit}>
            Programar
          </Button>
        </>
      }
    >
      <DateField
        label="Fecha"
        value={date}
        minDate={min}
        error={error}
        onChange={(d) => {
          setDate(d);
          setError(undefined);
        }}
      />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Hora" options={HOURS} value={hour} onChange={setHour} />
        <SelectField label="Duración" options={DURATIONS} value={duration} onChange={setDuration} />
      </div>
      <TextField label="Quién más asiste" value={guests} onChange={(e) => setGuests(e.target.value)} help="Correos separados por coma" />
    </Modal>
  );
}

const REASONS = [
  { value: "contrast", label: "Los contrastes con la hoja de vida no se explican" },
  { value: "level", label: "El nivel técnico no corresponde al cargo" },
  { value: "english", label: "El nivel de inglés no alcanza" },
  { value: "withdrew", label: "Retiró su postulación" },
];

/** Descartar después de la entrevista, siempre con motivo auditable. */
export function DiscardInterviewModal({ name, open, busy = false, onClose, onDiscard }: { name: string; open: boolean; busy?: boolean; onClose: () => void; onDiscard: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Descartar a ${name}`}
      description="El motivo queda en la auditoría. Nunca se usan edad, género, foto ni origen."
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 />}
            loading={busy}
            onClick={() => (reason ? onDiscard(REASONS.find((r) => r.value === reason)?.label ?? reason) : setError("Elige un motivo"))}
          >
            Descartar
          </Button>
        </>
      }
    >
      <SelectField
        label="Motivo"
        placeholder="Elige el motivo"
        options={REASONS}
        value={reason}
        error={error}
        onChange={(v) => {
          setReason(v);
          setError(undefined);
        }}
      />
    </Modal>
  );
}
