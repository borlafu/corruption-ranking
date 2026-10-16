import Link from "next/link";
import { LegalPage, legalMetadata, linkClass } from "@/components/legal-page";
import { CONSENT_KEY, GA_STREAM_COOKIE } from "@/lib/analytics";
import { OWNER_NAME } from "@/lib/site";

// Second information layer behind the consent banner (LSSI art. 22.2, AEPD cookie guide).
// Change it whenever a cookie, tracker or storage key is added or removed.
export const metadata = legalMetadata(
  "/cookies",
  "Política de cookies",
  "Qué cookies usa España Corrupta, para qué sirven y cómo aceptarlas, rechazarlas o retirar el consentimiento.",
);

const cookies = [
  { name: "_ga", owner: "Google", purpose: "Distinguir un navegador de otro para contar visitantes únicos.", duration: "2 años" },
  { name: GA_STREAM_COOKIE, owner: "Google", purpose: "Mantener el estado de tu visita a esta web.", duration: "2 años" },
];

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies" updated="2026-10-17">
      <p>
        Esta web usa cookies solo para medir la audiencia, y solo si lo aceptas. Aquí se explica cuáles son, para qué
        sirven y cómo cambiar de opinión.
      </p>

      <h2>Qué son las cookies</h2>
      <p>Pequeños archivos que una web guarda en tu navegador para reconocerlo en visitas posteriores.</p>

      <h2>Quién las usa</h2>
      <p>
        La web la edita {OWNER_NAME}. Las cookies de medición son de un tercero, Google, que presta el servicio Google
        Analytics y trata los datos por cuenta del editor.
      </p>

      <h2>Cookies que usamos</h2>
      <p>Todas son de análisis y solo se instalan si pulsas «Aceptar»:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">Nombre</th>
              <th scope="col" className="py-2 pr-4 font-medium">Titular</th>
              <th scope="col" className="py-2 pr-4 font-medium">Finalidad</th>
              <th scope="col" className="py-2 font-medium">Duración</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name} className="border-b last:border-0 align-top">
                <td className="py-2 pr-4"><code>{c.name}</code></td>
                <td className="py-2 pr-4">{c.owner}</td>
                <td className="py-2 pr-4">{c.purpose}</td>
                <td className="py-2 whitespace-nowrap">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Además, la web guarda tu elección en el almacenamiento local del navegador (<code>{CONSENT_KEY}</code>) para no
        volver a preguntarte. Es técnico, no sirve para medir nada y dura hasta que borres los datos del navegador.
      </p>
      <p>Rechazar las cookies no limita nada: la web funciona exactamente igual.</p>

      <h2>Cómo aceptar, rechazar o retirar el consentimiento</h2>
      <ul>
        <li>La primera vez que entras, el aviso inferior te deja aceptar o rechazar con un solo clic.</li>
        <li>
          Puedes cambiar de opinión cuando quieras desde «Preferencias de cookies», al pie de cada página. Si retiras el
          consentimiento, la web borra las cookies de Google Analytics y deja de medir tu visita.
        </li>
        <li>También puedes bloquear o borrar las cookies desde la configuración de tu navegador.</li>
      </ul>

      <h2>Transferencias internacionales</h2>
      <p>
        Google puede tratar estos datos en Estados Unidos. Google LLC está adherida al Marco de Privacidad de Datos
        UE-EE. UU., que la Comisión Europea reconoce como garantía de un nivel de protección adecuado.
      </p>

      <h2>Más información</h2>
      <p>
        Qué datos se tratan, durante cuánto tiempo y cómo ejercer tus derechos:{" "}
        <Link href="/privacidad" className={linkClass}>política de privacidad</Link>. Cómo trata Google los datos:{" "}
        <a href="https://policies.google.com/privacy" className={linkClass}>política de privacidad de Google</a>.
      </p>
    </LegalPage>
  );
}
