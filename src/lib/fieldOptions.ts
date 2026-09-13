// Opciones reutilizables para selects de formularios del admin.
// El `value` es el CÓDIGO compacto que se guarda en la BD; el `label` es la
// etiqueta legible que ve el usuario. Debe mantenerse sincronizado con
// backpacking-api/api/field_codes.py (único origen de verdad en el backend).

export interface Option { value: string; label: string; }

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Mejor época: bitmask de meses (bit i = MONTHS[i])
export const monthsToMask = (names: string[]): number =>
  names.reduce((mask, n) => {
    const i = MONTHS.indexOf(n.trim());
    return i >= 0 ? mask | (1 << i) : mask;
  }, 0);

export const maskToMonths = (mask: number): string[] =>
  MONTHS.filter((_, i) => (mask & (1 << i)) !== 0);

// Idioma → ISO 639-1
export const LANGUAGE_OPTIONS: Option[] = [
  { value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' }, { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' }, { value: 'it', label: 'Italiano' },
  { value: 'nl', label: 'Neerlandés' }, { value: 'ca', label: 'Catalán' },
  { value: 'gl', label: 'Gallego' }, { value: 'eu', label: 'Euskera' },
  { value: 'el', label: 'Griego' }, { value: 'tr', label: 'Turco' },
  { value: 'ru', label: 'Ruso' }, { value: 'pl', label: 'Polaco' },
  { value: 'cs', label: 'Checo' }, { value: 'hu', label: 'Húngaro' },
  { value: 'sv', label: 'Sueco' }, { value: 'no', label: 'Noruego' },
  { value: 'da', label: 'Danés' }, { value: 'fi', label: 'Finés' },
  { value: 'ar', label: 'Árabe' }, { value: 'he', label: 'Hebreo' },
  { value: 'fa', label: 'Persa' }, { value: 'ja', label: 'Japonés' },
  { value: 'zh', label: 'Mandarín' }, { value: 'ko', label: 'Coreano' },
  { value: 'th', label: 'Tailandés' }, { value: 'vi', label: 'Vietnamita' },
  { value: 'id', label: 'Indonesio' }, { value: 'ms', label: 'Malayo' },
  { value: 'tl', label: 'Tagalo' }, { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengalí' }, { value: 'ur', label: 'Urdu' },
  { value: 'sw', label: 'Suajili' }, { value: 'am', label: 'Amárico' },
  { value: 'af', label: 'Afrikáans' },
];

// Moneda → ISO 4217
export const CURRENCY_OPTIONS: Option[] = [
  { value: 'DOP', label: 'DOP (RD$) — Peso dominicano' },
  { value: 'USD', label: 'USD ($) — Dólar estadounidense' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'GBP', label: 'GBP (£) — Libra esterlina' },
  { value: 'JPY', label: 'JPY (¥) — Yen japonés' },
  { value: 'CHF', label: 'CHF (Fr) — Franco suizo' },
  { value: 'CAD', label: 'CAD ($) — Dólar canadiense' },
  { value: 'AUD', label: 'AUD ($) — Dólar australiano' },
  { value: 'NZD', label: 'NZD ($) — Dólar neozelandés' },
  { value: 'MXN', label: 'MXN ($) — Peso mexicano' },
  { value: 'GTQ', label: 'GTQ (Q) — Quetzal guatemalteco' },
  { value: 'CRC', label: 'CRC (₡) — Colón costarricense' },
  { value: 'COP', label: 'COP ($) — Peso colombiano' },
  { value: 'PEN', label: 'PEN (S/) — Sol peruano' },
  { value: 'CLP', label: 'CLP ($) — Peso chileno' },
  { value: 'ARS', label: 'ARS ($) — Peso argentino' },
  { value: 'UYU', label: 'UYU ($) — Peso uruguayo' },
  { value: 'BOB', label: 'BOB (Bs) — Boliviano' },
  { value: 'BRL', label: 'BRL (R$) — Real brasileño' },
  { value: 'THB', label: 'THB (฿) — Baht tailandés' },
  { value: 'VND', label: 'VND (₫) — Dong vietnamita' },
  { value: 'IDR', label: 'IDR (Rp) — Rupia indonesia' },
  { value: 'MYR', label: 'MYR (RM) — Ringgit malayo' },
  { value: 'PHP', label: 'PHP (₱) — Peso filipino' },
  { value: 'INR', label: 'INR (₹) — Rupia india' },
  { value: 'CNY', label: 'CNY (¥) — Yuan chino' },
  { value: 'KRW', label: 'KRW (₩) — Won surcoreano' },
  { value: 'SGD', label: 'SGD ($) — Dólar de Singapur' },
  { value: 'HKD', label: 'HKD ($) — Dólar de Hong Kong' },
  { value: 'AED', label: 'AED (د.إ) — Dírham de los EAU' },
  { value: 'TRY', label: 'TRY (₺) — Lira turca' },
  { value: 'EGP', label: 'EGP (E£) — Libra egipcia' },
  { value: 'MAD', label: 'MAD (DH) — Dírham marroquí' },
  { value: 'ZAR', label: 'ZAR (R) — Rand sudafricano' },
  { value: 'KES', label: 'KES (KSh) — Chelín keniano' },
];

// Zona horaria → offset UTC en minutos (string para el <select>)
export const TIMEZONE_OPTIONS: Option[] = [
  { value: '-600', label: 'UTC-10 (HST)' }, { value: '-540', label: 'UTC-9 (AKST)' },
  { value: '-480', label: 'UTC-8 (PST)' }, { value: '-420', label: 'UTC-7 (MST)' },
  { value: '-360', label: 'UTC-6 (CST)' }, { value: '-300', label: 'UTC-5 (EST)' },
  { value: '-240', label: 'UTC-4 (AST)' }, { value: '-180', label: 'UTC-3' },
  { value: '-120', label: 'UTC-2' }, { value: '-60', label: 'UTC-1' },
  { value: '0', label: 'UTC±0 (GMT)' }, { value: '60', label: 'UTC+1 (CET)' },
  { value: '120', label: 'UTC+2 (EET)' }, { value: '180', label: 'UTC+3 (MSK)' },
  { value: '210', label: 'UTC+3:30' }, { value: '240', label: 'UTC+4' },
  { value: '300', label: 'UTC+5' }, { value: '330', label: 'UTC+5:30 (IST)' },
  { value: '360', label: 'UTC+6' }, { value: '420', label: 'UTC+7 (ICT)' },
  { value: '480', label: 'UTC+8 (CST China)' }, { value: '540', label: 'UTC+9 (JST)' },
  { value: '570', label: 'UTC+9:30 (ACST)' }, { value: '600', label: 'UTC+10 (AEST)' },
  { value: '720', label: 'UTC+12 (NZST)' },
];

export const FOREIGNER_OPTIONS: Option[] = [
  { value: 'M', label: 'Muy amigable' }, { value: 'A', label: 'Amigable' },
  { value: 'C', label: 'Acogedor' }, { value: 'N', label: 'Neutral' },
  { value: 'R', label: 'Reservado' }, { value: 'D', label: 'Distante' },
];

export const HEALTHCARE_OPTIONS: Option[] = [
  { value: 'E', label: 'Excelente (público universal)' },
  { value: 'B', label: 'Bueno (público y privado)' },
  { value: 'A', label: 'Aceptable (mixto)' },
  { value: 'C', label: 'Básico (recomendado seguro de viaje)' },
  { value: 'L', label: 'Limitado' }, { value: 'P', label: 'Solo privado' },
];

export const ELECTRICITY_OPTIONS: Option[] = [
  { value: 'A', label: '230V / 50Hz – Tipo C y F (Europeo)' },
  { value: 'B', label: '230V / 50Hz – Tipo G (Británico)' },
  { value: 'C', label: '230V / 50Hz – Tipo L (Italia)' },
  { value: 'D', label: '230V / 50Hz – Tipo I (Australia)' },
  { value: 'E', label: '120V / 60Hz – Tipo A y B (Americano)' },
  { value: 'F', label: '127V / 60Hz – Tipo A y B' },
  { value: 'G', label: '220V / 60Hz – Tipo A, B y C' },
  { value: 'H', label: '100V / 50-60Hz – Tipo A y B (Japón)' },
  { value: 'I', label: '220V / 50Hz – Tipo D y M (India/Sudáfrica)' },
];

export const SAFETY_OPTIONS: Option[] = [
  { value: '5', label: 'Muy seguro' }, { value: '4', label: 'Seguro' },
  { value: '3', label: 'Moderado' }, { value: '2', label: 'Precaución' },
  { value: '1', label: 'Inseguro' },
];

// Etiquetas en español para las claves del JSON de Calidad de Vida.
export const QOL_LABELS: Record<string, string> = {
  internet_speed: 'Velocidad de internet',
  safety_level: 'Nivel de seguridad',
  electricity: 'Tipo de electricidad',
  healthcare: 'Sistema de salud',
  public_wifi: 'WiFi en espacios públicos',
  friendly_to_foreigners: 'Trato a extranjeros',
  recommended_days: 'Días recomendados',
};

// Escala del costo de vida general. OJO: el valor se guarda tal cual y el
// portal público lo pinta sin traducir (DestinationDetail), así que el `value`
// es la etiqueta legible, no un código numérico. Incluye los valores que ya
// existen en la BD ('Moderado', 'Caro') para no romper destinos guardados.
export const COST_GENERAL_OPTIONS: Option[] = [
  { value: 'Muy económico', label: 'Muy económico' },
  { value: 'Económico', label: 'Económico' },
  { value: 'Asequible', label: 'Asequible' },
  { value: 'Moderado', label: 'Moderado' },
  { value: 'Moderado a alto', label: 'Moderado a alto' },
  { value: 'Caro', label: 'Caro' },
  { value: 'Muy caro', label: 'Muy caro' },
];

// Selects especiales dentro de "Costo de Vida" (clave -> opciones). El resto de
// claves son importes y siguen siendo campos de texto libre.
export const COST_SELECT_OPTIONS: Record<string, Option[]> = {
  general: COST_GENERAL_OPTIONS,
};

// Etiquetas en español para las claves del JSON de Costo de Vida.
export const COST_LABELS: Record<string, string> = {
  general: 'Costo de vida general',
  accommodation_per_night: 'Alojamiento por noche',
  daily_meal: 'Plato del día',
  public_transport: 'Transporte público',
  dinner: 'Cena',
  breakfast: 'Desayuno',
  airport_transfer: 'Traslado del aeropuerto',
  coca_cola: 'Refresco',
  mc_burger: 'Hamburguesa',
  pizza: 'Pizza',
};

// Devuelve la etiqueta en español de una clave, o la clave "humanizada" como respaldo.
export const labelFor = (map: Record<string, string>, key: string): string =>
  map[key] ?? key.replace(/_/g, ' ');

// Selects especiales dentro de "Calidad de Vida" (clave -> opciones)
export const QOL_SELECT_OPTIONS: Record<string, Option[]> = {
  friendly_to_foreigners: FOREIGNER_OPTIONS,
  healthcare: HEALTHCARE_OPTIONS,
  electricity: ELECTRICITY_OPTIONS,
  safety_level: SAFETY_OPTIONS,
};
