export interface Santo {
  id: number;
  nombre: string;
  tipo: string;
  origen: string;
  fechas: string;
  festividad: string;
  categoria: string;
  etiqueta: string;
  historia: string;
  cita: string;
  conexion_fundacion: string;
  color_acento: string;
}

export const saints: Santo[] = [
  {
    id: 1,
    nombre: 'San Carlos Lwanga',
    tipo: 'Santo (canonizado)',
    origen: 'Uganda',
    fechas: '† 3 junio 1886',
    festividad: '3 de junio',
    categoria: 'Mártir africano',
    etiqueta: 'Patrón de la juventud africana',
    historia:
      'Prefecto del palacio real del rey Mwanga II, protegió a los jóvenes pajes catequistas bajo su cargo cuando el rey inició la persecución. Murió quemado vivo en Namugongo con 25 años antes de renegar de su fe. Canonizado por Pablo VI en 1964 durante el Concilio Vaticano II.',
    cita: 'Aunque me quemes, no renegaré de mi fe.',
    conexion_fundacion:
      'Patrón oficial de la juventud del África cristiana. Símbolo de la fe que la Fundación quiere sembrar en Benín entre los niños y jóvenes de los orfanatos.',
    color_acento: '#c0392b',
  },
  {
    id: 2,
    nombre: 'Santa Josefina Bakhita',
    tipo: 'Santa (canonizada)',
    origen: 'Sudán',
    fechas: '1869 – 1947',
    festividad: '8 de febrero',
    categoria: 'Mártir africana',
    etiqueta: 'La esclava que encontró a Dios',
    historia:
      'Secuestrada a los 9 años y vendida como esclava cinco veces. Llegó a Italia, fue bautizada y entró en las Canossinas. Vivió como religiosa con una serenidad que asombraba. Canonizada por Juan Pablo II en el año 2000. Patrona de Sudán y de las víctimas de tráfico humano.',
    cita: 'Si volviera a encontrar a quienes me raptaron, me arrodillaría a besar sus manos.',
    conexion_fundacion:
      'Su historia resuena directamente con la misión de la Fundación con madres solteras y niños vulnerables en Benín. Patrona contra la trata de personas.',
    color_acento: '#8e44ad',
  },
  {
    id: 3,
    nombre: 'Beato Isidoro Bakanja',
    tipo: 'Beato (beatificado)',
    origen: 'Congo',
    fechas: '† 1909',
    festividad: '12 de agosto',
    categoria: 'Mártir africano',
    etiqueta: 'El mártir del escapulario',
    historia:
      'Joven catequista congoleño torturado brutalmente por su patrono colonial por negarse a quitarse el escapulario del Carmelo y por evangelizar a otros esclavos. Tardó meses en morir de sus heridas. Sus últimas palabras fueron de perdón para su verdugo. Beatificado por Juan Pablo II en 1994.',
    cita: 'Si me vieras de nuevo, le diría que también él se convierta.',
    conexion_fundacion:
      'Símbolo de la dignidad africana ante la opresión colonial, en el mismo período histórico que define el contexto de Benín.',
    color_acento: '#d35400',
  },
  {
    id: 4,
    nombre: 'San Daniel Comboni',
    tipo: 'Santo (canonizado)',
    origen: 'Italia — misionero en África Central',
    fechas: '1831 – 1881',
    festividad: '10 de octubre',
    categoria: 'Misionero europeo en África',
    etiqueta: '"Salvar África con África"',
    historia:
      'Sacerdote italiano que consagró su vida al corazón de África. Fundó los Misioneros y las Misioneras Combonianas. Primer obispo del África Central. Luchó incansablemente contra la esclavitud. Murió agotado en Jartum a los 50 años. Canonizado por Juan Pablo II en 2003.',
    cita: 'O África o muerte. Y es África.',
    conexion_fundacion:
      'Su lema "Salvar África con África" —evangelizar desde dentro formando líderes locales— es la filosofía exacta de Fundación Luz de Benín.',
    color_acento: '#16a085',
  },
  {
    id: 5,
    nombre: 'San Kizito',
    tipo: 'Santo (canonizado)',
    origen: 'Uganda',
    fechas: '† 3 junio 1886',
    festividad: '3 de junio',
    categoria: 'Mártir africano',
    etiqueta: 'El más joven de los mártires',
    historia:
      'Tenía 14 años cuando fue ejecutado en Namugongo junto a Carlos Lwanga. Pidió ser bautizado la víspera de su martirio. Cuando Lwanga le tomó de la mano diciéndole "moriremos juntos", Kizito respondió con una sonrisa. Canonizado por Pablo VI en 1964.',
    cita: 'Prefiero morir cristiano que vivir renegando de Dios.',
    conexion_fundacion:
      'Patrón de los niños y adolescentes africanos. Símbolo directo de la misión de la Fundación con los huérfanos de Benín.',
    color_acento: '#f39c12',
  },
  {
    id: 6,
    nombre: 'Beata Anuarite Nengapeta',
    tipo: 'Beata (beatificada)',
    origen: 'Congo / Zaire',
    fechas: '† 1 diciembre 1964',
    festividad: '1 de diciembre',
    categoria: 'Mártir africana',
    etiqueta: 'La virgen mártir del Congo',
    historia:
      'Religiosa de las Hermanas de la Sagrada Familia, asesinada por un coronel rebelde al resistir la violación. Murió con 25 años. Sus últimas palabras fueron de perdón. Beatificada por Juan Pablo II en Kinshasa en 1985, durante su visita a África.',
    cita: 'Te perdono porque no sabes lo que haces.',
    conexion_fundacion:
      'Su martirio es especialmente relevante para la misión de la Fundación con mujeres vulnerables y madres solteras en el África subsahariana.',
    color_acento: '#2980b9',
  },
  {
    id: 7,
    nombre: 'San Pedro Claver',
    tipo: 'Santo (canonizado)',
    origen: 'Cataluña — misionero con esclavos africanos',
    fechas: '1580 – 1654',
    festividad: '9 de septiembre',
    categoria: 'Misionero europeo con África',
    etiqueta: 'El esclavo de los esclavos',
    historia:
      'Jesuita catalán que pasó 44 años en el puerto de Cartagena de Indias recibiendo los barcos de esclavos africanos. Era el primero en bajar a las bodegas, llevando medicina, comida y el Evangelio. Bautizó y asistió a más de 300.000 personas. Canonizado en 1888.',
    cita: 'Me hago esclavo de los esclavos para siempre.',
    conexion_fundacion:
      'El más "español" de los santos misioneros vinculados a África. Puente entre la identidad española de la Fundación y la dignidad de los africanos.',
    color_acento: '#1a5276',
  },
  {
    id: 8,
    nombre: 'San Martín de Porres',
    tipo: 'Santo (canonizado)',
    origen: 'Perú — hijo de madre africana',
    fechas: '1579 – 1639',
    festividad: '3 de noviembre',
    categoria: 'Santo de raíz africana',
    etiqueta: 'El hermano de los pobres',
    historia:
      'Hijo de un español y una esclava liberada de origen africano. Dominico lego que dedicó su vida a los más pobres de Lima. Fundó un orfanato, un hospital y una escuela. Nunca rechazó a nadie por su raza o condición. Canonizado por Juan XXIII en 1962.',
    cita: 'La caridad no conoce raza ni condición.',
    conexion_fundacion:
      'Su herencia africana y su obra con huérfanos y pobres lo conectan directamente con los tres pilares de la Fundación: orfanatos, madres solteras y comunidades vulnerables.',
    color_acento: '#6c3483',
  },
  {
    id: 9,
    nombre: 'San Carlos de Foucauld',
    tipo: 'Santo (canonizado)',
    origen: 'Francia — ermitaño en el Sáhara',
    fechas: '1858 – 1916',
    festividad: '1 de diciembre',
    categoria: 'Misionero europeo en África',
    etiqueta: 'El hermano universal del desierto',
    historia:
      'Noble oficial francés convertido que lo dejó todo para vivir como ermitaño entre los tuaregs del Sáhara. Aprendió su lengua, defendió a los esclavos, vivió en pobreza extrema. Murió asesinado por rebeldes. Canonizado por el Papa Francisco en mayo de 2022.',
    cita: 'Grita el Evangelio con tu vida.',
    conexion_fundacion:
      'Encarna la opción de quedarse con los más pobres de África sin imponer nada, solo acompañando. Una espiritualidad que impregna la presencia de la Fundación en Benín.',
    color_acento: '#e67e22',
  },
  {
    id: 10,
    nombre: 'Beato Cipriano Iwene Tansi',
    tipo: 'Beato (beatificado)',
    origen: 'Nigeria',
    fechas: '1903 – 1964',
    festividad: '20 de enero',
    categoria: 'Santo africano',
    etiqueta: 'El primer beato de Nigeria',
    historia:
      'Sacerdote igbo del sur de Nigeria. Luchó por el acceso de las mujeres a la educación, trabajó incansablemente la pastoral familiar y promovió la castidad. Después ingresó como monje cisterciense en Inglaterra con el sueño de llevar la vida contemplativa de vuelta a África. Beatificado por Juan Pablo II en 1998.',
    cita: 'La familia es el corazón de la evangelización.',
    conexion_fundacion:
      'Su compromiso con la educación de las mujeres y la pastoral familiar en Nigeria conecta directamente con el trabajo de la Fundación con madres solteras en Benín.',
    color_acento: '#27ae60',
  },
  {
    id: 11,
    nombre: 'Beato Benedict Daswa',
    tipo: 'Beato (beatificado)',
    origen: 'Sudáfrica',
    fechas: '1946 – 1990',
    festividad: '2 de febrero',
    categoria: 'Mártir africano',
    etiqueta: 'El primer beato de Sudáfrica',
    historia:
      'Director de escuela primaria, catequista y padre de familia. Fue asesinado en 1990 por negarse a contribuir al consejo de ancianos para pagar a un brujo. Ante la amenaza de matar a la mujer que le escondía, se entregó a sus asesinos diciendo: "Padre, recibe mi espíritu". Beatificado por Francisco en 2015.',
    cita: 'Padre, recibe mi espíritu.',
    conexion_fundacion:
      'Laico comprometido con la educación y la fe en su comunidad. Un modelo de catequista africano que se puede reconocer en los colaboradores locales de la Fundación.',
    color_acento: '#2ecc71',
  },
  {
    id: 12,
    nombre: 'Beata Victoria Rasoamanarivo',
    tipo: 'Beata (beatificada)',
    origen: 'Madagascar',
    fechas: '1848 – 1894',
    festividad: '21 de agosto',
    categoria: 'Santa africana',
    etiqueta: 'La defensora de la fe en Madagascar',
    historia:
      'Princesa malgache que, cuando los misioneros jesuitas fueron expulsados, se convirtió en el pilar que mantuvo viva la comunidad cristiana de toda Madagascar. Sin sacerdotes, reunía a los fieles, enseñaba, bautizaba a los moribundos. Beatificada por Juan Pablo II en 1989.',
    cita: 'Dios no nos abandona aunque los hombres nos fallen.',
    conexion_fundacion:
      'Mujer africana de fe que sostuvo a su comunidad en los momentos más difíciles. Un arquetipo de las madres de Benín que, con fe, sacan adelante a sus hijos.',
    color_acento: '#e91e8c',
  },
  {
    id: 13,
    nombre: 'San Agustín de Hipona',
    tipo: 'Santo (canonizado) y Doctor de la Iglesia',
    origen: 'Numidia — actual Argelia',
    fechas: '354 – 430',
    festividad: '28 de agosto',
    categoria: 'Padre de la Iglesia africano',
    etiqueta: 'El mayor pensador del África cristiana',
    historia:
      'Nacido en Tagaste (Argelia), hijo de Santa Mónica. Llevó una vida disoluta hasta su conversión a los 33 años. Obispo de Hipona durante 35 años. Sus obras —las Confesiones, La Ciudad de Dios— son fundamento de toda la teología occidental. Doctor de la Iglesia.',
    cita: 'Nos hiciste para Ti, Señor, y nuestro corazón está inquieto hasta que descanse en Ti.',
    conexion_fundacion:
      'El mayor testimonio de que de África nació buena parte del pensamiento cristiano. Su conversión muestra que nadie está perdido para la misericordia de Dios.',
    color_acento: '#795548',
  },
  {
    id: 14,
    nombre: 'Santa Mónica',
    tipo: 'Santa (canonizada)',
    origen: 'Numidia — actual Argelia',
    fechas: '331 – 387',
    festividad: '27 de agosto',
    categoria: 'Padre de la Iglesia africano',
    etiqueta: 'La madre que nunca abandonó',
    historia:
      'Madre de San Agustín. Africana bereber que durante 17 años rezó y lloró sin cesar por la conversión de su hijo. Un obispo le dijo: "No es posible que se pierda el hijo de tantas lágrimas". Murió poco después de ver bautizarse a Agustín.',
    cita: 'No es posible que se pierda el hijo de tantas lágrimas.',
    conexion_fundacion:
      'Patrona de las madres con hijos en situaciones difíciles. Su figura conecta directamente con las madres solteras que acompaña la Fundación en Benín.',
    color_acento: '#ff7043',
  },
  {
    id: 15,
    nombre: 'Santas Perpetua y Felicidad',
    tipo: 'Santas (canonizadas)',
    origen: 'Cartago — actual Túnez',
    fechas: '† 7 marzo 203',
    festividad: '7 de marzo',
    categoria: 'Mártir africana',
    etiqueta: 'Las primeras mártires africanas de nombre conocido',
    historia:
      'Vibia Perpetua era una joven noble cartaginesa con un bebé lactante; Felicidad, su esclava embarazada. Ambas murieron en el anfiteatro de Cartago, arrojadas a las fieras y después degolladas. Su martirio es uno de los documentos más antiguos del cristianismo, escrito en parte por la propia Perpetua.',
    cita: 'Quedé de pie, y así veré luchar a mis compañeros, y así también ellos me verán luchar.',
    conexion_fundacion:
      'Noble y esclava africanas muriendo juntas por Cristo. Una imagen poderosa de la igualdad de dignidad que la Fundación defiende en Benín.',
    color_acento: '#c62828',
  },
  {
    id: 16,
    nombre: 'San Atanasio de Alejandría',
    tipo: 'Santo (canonizado) y Doctor de la Iglesia',
    origen: 'Alejandría, Egipto',
    fechas: '295 – 373',
    festividad: '2 de mayo',
    categoria: 'Padre de la Iglesia africano',
    etiqueta: 'Atanasio contra el mundo',
    historia:
      'Obispo de Alejandría que durante 45 años defendió la divinidad de Cristo frente a la herejía arriana. Fue exiliado cinco veces por emperadores y papas. Nunca cedió. Su frase "Atanasio contra el mundo" se convirtió en símbolo de la fidelidad solitaria a la verdad.',
    cita: '¿Qué importa que el mundo esté contra nosotros si la verdad está con nosotros?',
    conexion_fundacion:
      'Símbolo de no rendirse ante la adversidad. Una actitud que reconocen quienes trabajan en misiones africanas ante la pobreza estructural.',
    color_acento: '#1565c0',
  },
  {
    id: 17,
    nombre: 'San Antonio Abad',
    tipo: 'Santo (canonizado)',
    origen: 'Egipto',
    fechas: '251 – 356',
    festividad: '17 de enero',
    categoria: 'Padre del desierto africano',
    etiqueta: 'El padre del monacato cristiano',
    historia:
      'Nacido en Egipto, a los 20 años lo vendió todo y se fue al desierto. Vivió 105 años. Fundó sin quererlo la tradición monástica cristiana: miles de personas lo seguían al desierto para aprender a orar. San Atanasio escribió su vida, que se convirtió en el libro más leído del siglo IV.',
    cita: 'Aprende a conocerte a ti mismo y tendrás todo lo que necesitas.',
    conexion_fundacion:
      'El desierto africano como lugar de encuentro con Dios. Sus discípulos misioneros llegarían con el tiempo hasta el África subsahariana.',
    color_acento: '#546e7a',
  },
  {
    id: 18,
    nombre: 'San Moisés el Negro',
    tipo: 'Santo (canonizado)',
    origen: 'Etiopía / Nubia',
    fechas: '330 – 405',
    festividad: '28 de agosto',
    categoria: 'Padre del desierto africano',
    etiqueta: 'El asesino que se convirtió en padre espiritual',
    historia:
      'Etíope o nubio, fue esclavo, ladrón y cabecilla de una banda de salteadores antes de su conversión radical. Se fue al desierto egipcio y se convirtió en uno de los Padres del Desierto más venerados. Cuando una tribu amenazó su monasterio, se quedó el último para no matar. Murió mártir.',
    cita: 'Siéntate en tu celda y ella te enseñará todo lo que necesitas saber.',
    conexion_fundacion:
      'El africano convertido que se convierte en maestro espiritual. Un símbolo de la transformación que la fe obra en las personas, independientemente de su pasado.',
    color_acento: '#37474f',
  },
  {
    id: 19,
    nombre: 'San Benito el Moro',
    tipo: 'Santo (canonizado)',
    origen: 'Sicilia — hijo de esclavos africanos',
    fechas: '1526 – 1589',
    festividad: '4 de abril',
    categoria: 'Santo de raíz africana',
    etiqueta: 'El cocinero santo',
    historia:
      'Hijo de esclavos africanos nacido en Sicilia. Apodado "el Moro" por su color de piel. Se hizo franciscano y acabó siendo superior y maestro de novicios de su convento, a pesar de ser analfabeto. Fue copatrón de Palermo. Canonizado por Pío VII en 1807.',
    cita: 'No hay dignidad mayor que servir a los hermanos.',
    conexion_fundacion:
      'De esclavo a santo: la historia de dignidad que la Fundación quiere construir en Benín, donde tantos niños parten desde la vulnerabilidad.',
    color_acento: '#5d4037',
  },
  {
    id: 20,
    nombre: 'Beato Jacques Berthieu',
    tipo: 'Santo (canonizado)',
    origen: 'Francia — misionero en Madagascar',
    fechas: '1838 – 1896',
    festividad: '8 de junio',
    categoria: 'Misionero europeo en África',
    etiqueta: 'El mártir jesuita de Madagascar',
    historia:
      'Sacerdote jesuita francés que evangelizó Madagascar durante décadas. Construyó escuelas, formó catequistas, defendió a los pobres frente a los ricos. Fue capturado por rebeldes malgaches y asesinado al negarse a apostatar. Beatificado en 1965, canonizado por Benedicto XVI en 2012.',
    cita: 'Morir por mi fe es el don más grande que Dios podría hacerme.',
    conexion_fundacion:
      'Misionero que construyó escuelas y formó catequistas locales en África. Un espejo exacto del trabajo educativo de la Fundación en Benín.',
    color_acento: '#880e4f',
  },
  {
    id: 21,
    nombre: 'Beato José Mkasa Balikuddembe',
    tipo: 'Santo (canonizado)',
    origen: 'Uganda',
    fechas: '† 15 noviembre 1885',
    festividad: '3 de junio',
    categoria: 'Mártir africano',
    etiqueta: 'El primer mártir de Uganda',
    historia:
      'Mayordomo jefe de la corte del rey Mwanga II y líder de la comunidad cristiana de Uganda. Reprendió públicamente al rey por haber ordenado asesinar a un misionero y por su vida disoluta. Fue quemado vivo. Su muerte inició la persecución de Namugongo. Canonizado por Pablo VI en 1964.',
    cita: 'Un cristiano que entrega su vida por Dios no tiene miedo de morir.',
    conexion_fundacion:
      'El valor de hablar con verdad al poder. Figura inspiradora para todos los que trabajan por la justicia en entornos difíciles como Benín.',
    color_acento: '#b71c1c',
  },
  {
    id: 22,
    nombre: 'San Marcos Evangelista',
    tipo: 'Santo (canonizado)',
    origen: 'Cirenaica — actual Libia / fundó la iglesia en Egipto',
    fechas: '† 68 d.C.',
    festividad: '25 de abril',
    categoria: 'Apóstol en África',
    etiqueta: 'El evangelista que fundó la Iglesia en África',
    historia:
      'Discípulo de Pedro, autor del segundo Evangelio. Fundó la Iglesia de Alejandría, la primera iglesia del continente africano. Fue el primer obispo de Alejandría. Murió mártir arrastrado por las calles atado a un caballo. Su tumba está en Venecia, adonde sus reliquias fueron trasladadas en el siglo IX.',
    cita: 'El principio del Evangelio de Jesucristo, el Hijo de Dios.',
    conexion_fundacion:
      'La semilla del Evangelio en África comenzó con Marcos. Todo el trabajo misionero en el continente, incluido el de la Fundación, conecta con este origen.',
    color_acento: '#e53935',
  },
];

/** Deterministic hash of email → always the same saint for the same email */
export function hashEmail(email: string): number {
  const str = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getSaintByEmail(email: string): Santo {
  return saints[hashEmail(email) % saints.length];
}

export function getSaintById(id: number): Santo | undefined {
  return saints.find((s) => s.id === id);
}
