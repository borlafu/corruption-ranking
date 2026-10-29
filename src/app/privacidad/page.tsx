import Link from "next/link";
import { LegalPage, legalMetadata, linkClass } from "@/components/legal-page";
import { OWNER_NAME, PRIVACY_EMAIL } from "@/lib/site";

// GDPR art. 13 notice for visitors' data. The suspects' own data is out of its scope.
// Retention must match GA Admin → Data collection and modification → Data retention.
export const metadata = legalMetadata(
  "/privacidad",
  "Política de privacidad",
  "Qué datos de los visitantes trata España Corrupta, con qué base legal, durante cuánto tiempo y cómo ejercer tus derechos.",
);

const email = (
  <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>
    {PRIVACY_EMAIL}
  </a>
);

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad" updated="2026-10-29">
      <p>
        Esta web no tiene registro, formularios ni comentarios: no te pide ningún dato. Solo trata los datos técnicos
        necesarios para servirte las páginas y, si aceptas las cookies, los de medición de audiencia.
      </p>

      <h2>Responsable</h2>
      <p>
        {OWNER_NAME}. Contacto: {email}.
      </p>

      <h2>Qué datos tratamos, para qué y con qué base legal</h2>
      <ul>
        <li>
          <strong>Medición de audiencia (Google Analytics), solo si aceptas las cookies.</strong> Un identificador
          aleatorio guardado en una cookie, las páginas que visitas y cuándo, el tipo de dispositivo y navegador, y tu
          ubicación aproximada (ciudad o región). Sirve para saber cuánta gente visita la web y qué páginas lee. Google
          Analytics no guarda tu dirección IP. Base legal: tu consentimiento (art. 6.1.a del RGPD).
        </li>
        <li>
          <strong>Alojamiento.</strong> Para servir la web, Firebase Hosting (Google) recibe tu dirección IP y los
          datos técnicos de cada petición. Base legal: el interés legítimo en mantener la web disponible y segura (art.
          6.1.f del RGPD).
        </li>
      </ul>

      <h2>Quién más accede a los datos</h2>
      <p>
        Google Ireland Limited presta Google Analytics y Firebase Hosting como encargado del tratamiento. No cedemos ni
        vendemos datos a nadie más. Google puede tratarlos en Estados Unidos; Google LLC está adherida al Marco de
        Privacidad de Datos UE-EE. UU., que la Comisión Europea reconoce como garantía de un nivel de protección
        adecuado.
      </p>

      <h2>Cuánto tiempo los conservamos</h2>
      <ul>
        <li>Google Analytics conserva los datos de cada visita 2 meses; después solo quedan cifras agregadas.</li>
        <li>Las cookies caducan a los 2 años, o antes si las borras o retiras el consentimiento.</li>
        <li>La web no guarda registros de acceso propios.</li>
      </ul>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir el acceso a tus datos, su rectificación o supresión, oponerte a su tratamiento, limitarlo o pedir
        su portabilidad escribiendo a {email}. Como los datos de medición no van unidos a tu nombre, para localizarlos
        necesitaremos el valor de tu cookie <code>_ga</code>.
      </p>
      <p>
        Puedes retirar tu consentimiento en cualquier momento desde «Preferencias de cookies», al pie de cada página,
        sin que afecte a lo tratado antes. Si crees que no se han respetado tus derechos, puedes reclamar ante la{" "}
        <a href="https://www.aepd.es" className={linkClass}>Agencia Española de Protección de Datos</a>.
      </p>

      <p>
        Detalle de cada cookie: <Link href="/cookies" className={linkClass}>política de cookies</Link>.
      </p>
    </LegalPage>
  );
}
