// Curated Universes and Franchise/Director Collections for CineCircle
export interface CollectionMovie {
  id: number;
  title: string;
  originalTitle?: string;
  releaseYear: string;
  posterPath: string | null;
  backdropPath?: string | null;
  voteAverage: number;
  overview?: string;
  mediaType?: "movie" | "tv";
  subGroup?: string;
}

export interface CollectionUniverse {
  id: string;
  name: string;
  category: "franchise" | "director";
  tagline: string;
  description: string;
  backdropPath: string | null;
  posterPath: string | null;
  subGroupLabel?: string;
  movies: CollectionMovie[];
}

export const COLLECTIONS_DATA: CollectionUniverse[] = [
  {
    "id": "star-wars",
    "name": "Star Wars Saga",
    "category": "franchise",
    "tagline": "Die größte Weltraumsaga der Filmgeschichte",
    "description": "Begleite die Familie Skywalker, Jedi und Rebellen im epischen Kampf gegen die dunkle Seite der Macht.",
    "backdropPath": "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
    "posterPath": "/crUUE14AROxNWsMdmyyqZNcUB6L.jpg",
    "movies": [
      {
        "id": 11,
        "title": "Krieg der Sterne",
        "originalTitle": "Star Wars",
        "releaseYear": "1977",
        "posterPath": "/crUUE14AROxNWsMdmyyqZNcUB6L.jpg",
        "backdropPath": "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
        "voteAverage": 8.2,
        "overview": "Seit der Vernichtung der Jedi-Ritter steht die Galaxie unter der grausamen Herrschaft des Imperiums. Nur eine kleine Gruppe von Rebellen, angeführt von der schönen Prinzessin Leia, widersetzt sich der dunklen Macht. Als es ihnen gelingt, die geheimen Baupläne für den gefährlichen Todesstern zu entwenden, gerät das Imperium in Aufruhr. Durch Zufall gelangen die Pläne ausgerechnet in die Hände des Farmerjungen Luke Skywalker, der spürt, dass er sein bisheriges Leben hinter sich lassen muss. Gemeinsam mit dem weisen Obi-Wan Kenobi, den Weltraumabenteurern Han Solo und Chewbacca sowie den Droiden R2-D2 und C-3PO nimmt er den Kampf gegen das mächtige Imperium auf. Es beginnt ein Wettlauf gegen die Zeit, denn der Kampfstern kann nur vor seiner Fertigstellung zerstört werden..."
      },
      {
        "id": 1891,
        "title": "Das Imperium schlägt zurück",
        "originalTitle": "The Empire Strikes Back",
        "releaseYear": "1980",
        "posterPath": "/mi08uIh7ZqYlJEMrc5l2986geSU.jpg",
        "backdropPath": "/k9pshruhCpJAdH9RaGJO6jaWQ4X.jpg",
        "voteAverage": 8.4,
        "overview": "Nach der Zerstörung des Todessterns geht der Kampf zwischen den Rebellen und dem herrschenden Imperium weiter. Die Rebellen haben sich auf den Eisplaneten Hoth zurückgezogen, doch das Imperium spürt sie auf und zerstört nach hartem Kampf die dortige Basis. Daraufhin teilen sich unsere Freunde auf: Luke gerät mit R2-D2 auf den Sumpfplaneten Dagobah, wo er von dem alten Jedi-Meister Yoda eine Ausbildung im Umgang mit der Macht erhält, während Leia, Han Solo und die anderen sich nach Bespin durchschlagen, wo in einer Wolkenstadt ein alter Freund von Han residiert. Doch dort geraten sie in eine Falle des Imperiums, und Luke muß ihnen zu Hilfe kommen und Darth Vader zu einem Duell herausfordern..."
      },
      {
        "id": 1892,
        "title": "Die Rückkehr der Jedi-Ritter",
        "originalTitle": "Return of the Jedi",
        "releaseYear": "1983",
        "posterPath": "/xwwbeCWW1jMSDPfRPJp8X4oySPr.jpg",
        "backdropPath": "/ziECpBRIyclmBNaFSWlvCfsKbMD.jpg",
        "voteAverage": 7.9,
        "overview": "Wesen aus allen Ecken der Galaxis treffen die Vorbereitungen für die entscheidende Schlacht gegen die Streitkräfte des Imperiums. Ziel der Aktion ist die totale Zerstörung des zweiten Todessterns, dessen unvorstellbare Feuerkraft ganze Planeten vernichten kann. Inzwischen ist Han Solo immer noch in der Wüstenfestung des mächtigsten und skrupellosesten Verbechers des Universums, Jabba the Hutt, gefangen. Luke Skywalker gelingt es schließlich zusammen mit seinen Gefährten Prinzessin Leia, Chewbacca und Lando Calrissian, sowie den beiden Robotern C3PO und R2D2 mit Han zu fliehen. Aber Luke steht die schwerste Prüfung noch bevor: Während auf dem Waldmond Endor und beim Todesstern die alles entscheidende Schlacht entbrennt, muß er sich seinem Erzfeind Darth Vader zu einem Zweikampf auf Leben und Tod stellen..."
      },
      {
        "id": 1893,
        "title": "Star Wars: Episode I - Die dunkle Bedrohung",
        "originalTitle": "Star Wars: Episode I - The Phantom Menace",
        "releaseYear": "1999",
        "posterPath": "/4e0X8XDjgLu3H2iKiCz44WEl7dA.jpg",
        "backdropPath": "/3TeGmKJfkik1D1rIoqGb1aR4k9c.jpg",
        "voteAverage": 6.6,
        "overview": "Nachdem der friedliche Planet Naboo von der Handelsföderation angegriffen wurde, müssen die Jedi-Ritter Qui-Gon Jinn und Obi-Wan Kenobi gemeinsam mit Königin Amidala auf dem Wüstenplaneten Tatooine notlanden. Dort bekommen sie Hilfe von Anakin Skywalker, einem Sklavenjungen, in dem die Macht ungewöhnlich stark ist. Als es Königin Amidala nicht gelingt, den Senat gegen die Handelsföderation zu mobilisieren, kehrt sie mit den Jedi-Rittern und Anakin nach Naboo zurück, um den Kampf allein fortzusetzen. Eine gewaltige Schlacht beginnt!"
      },
      {
        "id": 1894,
        "title": "Star Wars: Episode II - Angriff der Klonkrieger",
        "originalTitle": "Star Wars: Episode II - Attack of the Clones",
        "releaseYear": "2002",
        "posterPath": "/q090XcaB783cXdRBOU9TfsmGGP8.jpg",
        "backdropPath": "/cxvr2IOTwHcQa3EqMoQ8RHCkqBG.jpg",
        "voteAverage": 6.6,
        "overview": "Der junge Jedi-Schüler Anakin Skywalker beginnt sich allmählich zu einem grossen und ernstzunehmenden Jediritter zu entwickeln, der unter der Führung von Obi Wan-Kenobi steht. Jedoch hat er auch seine Problemzonen - diese bestehen aus der eigenen Arroganz, seiner nicht wissentlich vorhandenen grenzenlosen Macht, und der ihm verbotenen Liebe zu Königin Amidala. Auf diese werden kurz vor wichtigen Entscheidungen im Senat der Republik mehrere Attentate verübt, die jedoch vereitelt werden können. Daraufhin teilen sich Anakin und Obi-Wan auf: während Anakin auf Amidala aufpaßt, verfolgt Kenobi den Attentäter Jango Fett. Er kommt einer erschaffenen Klon-Armee auf die Spur, die mittels mysteriösem Auftrag geschaffen wurde und findet in dem ehemaligen Jedi Count Dooku einen neuen Gegner für die Hüter der Macht..."
      },
      {
        "id": 1895,
        "title": "Star Wars: Episode III - Die Rache der Sith",
        "originalTitle": "Star Wars: Episode III - Revenge of the Sith",
        "releaseYear": "2005",
        "posterPath": "/kW3v2VS0kRvMTS6atR4MzjrzxAP.jpg",
        "backdropPath": "/5vDuLrjJXFS9PTF7Q1xzobmYKR9.jpg",
        "voteAverage": 7.5,
        "overview": "Nach drei Jahren nähern sich die Klonkriege endlich dem Ende. Um die Separatisten endgültig zu besiegen, soll Obi-Wan Kenobi ihren Anführer General Grevious und Count Dooku ihrer gerechten Strafe zuführen. Zur Beunruhigung der schwangeren Padme nutzt daheim der endgültig vom Bösen korrumpierte Kanzler Palpatine die Gelegenheit, um den jungen Anakin Skywalker mit Versprechungen von unbegrenzter Macht auf die dunkle Seite zu ziehen. Ratlos und hin- und hergerissen wem er dienen soll, erliegt er geblendet von deren Machtverheißungen, den Versuchungen der dunklen Seite, schwört dem bösen Darth Sidious die Treue und nimmt die Identität von Darth Vader an. Die Sith-Lords beginnen zusammen einen Rachefeldzug, der in der Ermordung der Jedi seinen Anfang nimmt..."
      },
      {
        "id": 140607,
        "title": "Star Wars: Das Erwachen der Macht",
        "originalTitle": "Star Wars: The Force Awakens",
        "releaseYear": "2015",
        "posterPath": "/6EyJ3fxzjDr0Ly4i4u9VD8sja1N.jpg",
        "backdropPath": "/8BTsTfln4jlQrLXUBquXJ0ASQy9.jpg",
        "voteAverage": 7.2,
        "overview": "Über 30 Jahre sind vergangen, seitdem die Rebellen den zweiten Todesstern über Endor zerstört und damit die entscheidende Schlacht gegen die finsteren Mächte des Imperiums gewonnen haben. Doch aus der Asche des Bösen ist die Erste Ordnung empor gestiegen und hat die Herrschaft wieder an sich gerissen. Während Supreme Leader Snoke die Zügel im Hintergrund in den Händen hält, schickt er den Lichtschwert schwingenden Kylo Ren ins Feld, um die neue Weltordnung auch in den verstecktesten Winkeln der Galaxis zu verbreiten. Von großer Politik aber weiß Rey auf dem Wüstenplaneten Jakku zunächst nicht viel. Die junge Frau verbringt ihre Tage damit, die karge Landschaft nach Schrott abzusuchen, den sie danach verkauft. Sie ist allein, wartet auf ihre Familie – bis sie die Bekanntschaft von Finn macht, einem ehemaligen Sturmtruppler, den die Untaten der Ersten Ordnung abgeschreckt haben."
      },
      {
        "id": 330459,
        "title": "Rogue One: A Star Wars Story",
        "originalTitle": "Rogue One: A Star Wars Story",
        "releaseYear": "2016",
        "posterPath": "/xRGeAT2dAYmHT5ucsYBj4xegKdV.jpg",
        "backdropPath": "/6t8ES1d12OzWyCGxBeDYLHoaDrT.jpg",
        "voteAverage": 7.5,
        "overview": "Die mehrfach verurteilte Jyn Erso passt gut ins Anforderungsprofil für die Rebellion gegen das galaktische Imperium. Sie ist hart, kompromisslos und steht außerhalb der Gesellschaft. Aber es gibt noch einen weiteren, ganz speziellen Grund für ihre Anheuerung. Ihr Vater wurde vor Jahren von dem imperialen Karrieristen Krennic dazu gezwungen, für den Imperator eine neue Superwaffe zu entwickeln: den Todesstern. Dabei hat er heimlich eine Schwachstelle eingebaut und diese mit einem Hilferuf an die Rebellenallianz geschickt. Um diese Schwäche ausnutzen zu können, bedarf es allerdings der genauen Baupläne der Waffe. Zusammen mit dem Spion Cassian Andor und einer Schar unerschrockener Kämpfer bricht Jyn daraufhin zu dem Planeten Scarif auf, um die dort lagernden Baupläne des Todessterns zu erbeuten. Ein Himmelfahrtskommando, zumal der Rat der Rebellen aufgrund der vagen Informationen jegliche Unterstützung verweigert."
      },
      {
        "id": 181808,
        "title": "Star Wars: Die letzten Jedi",
        "originalTitle": "Star Wars: The Last Jedi",
        "releaseYear": "2017",
        "posterPath": "/6LyUrFO0i5AgpWVQlAQyA01Euhy.jpg",
        "backdropPath": "/5Iw7zQTHVRBOYpA0V6z0yypOPZh.jpg",
        "voteAverage": 6.7,
        "overview": "Die planetenvernichtende Starkiller-Basis der Ersten Ordnung ist zwar zerstört, die Neue Republik nach der vorherigen Zerstörung von fünf Welten aber massiv geschwächt. Sie steht am Abgrund und wird nur noch von Generalin Leias Widerstand verteidigt, für den auch Pilot Poe Dameron und der desertierte Ex-Sturmtruppler Finn kämpfen. Rey, mit den Erfahrungen ihres ersten großen Abenteuers in den Knochen, geht unterdessen bei Luke Skywalker auf dem Inselplaneten Ahch-To in die Lehre. Luke ist der letzte Jedi, der letzte Vertreter des Ordens, auf dem die Hoffnung ruht, dass Frieden in der Galaxis einkehrt. Doch die Erste Ordnung wirft ihren Schatten auch auf Luke und Rey: Der verlorene, ehemalige Schützling des alten Meisters, Kylo Ren, hat die finstere Mission noch längst nicht beendet, die ihm der sinistere Strippenzieher Snoke auftrug ..."
      },
      {
        "id": 348350,
        "title": "Solo: A Star Wars Story",
        "originalTitle": "Solo: A Star Wars Story",
        "releaseYear": "2018",
        "posterPath": "/oswfb5aM9NKi0iGHSiSL5HwiGxF.jpg",
        "backdropPath": "/y9jGaGNn1dQDhPkhMumXaLize73.jpg",
        "voteAverage": 6.6,
        "overview": "Im Mittelpunkt steht der junge Schmuggler Han Solo dessen erstes großes Abenteuer gezeigt wird. Solo ist von der Flugakademie geworfen worden, weil er seinen eigenen Kopf hat – eine Eigenschaft, die er auch anschließend nicht verliert. Sein Mentor, der zwielichtige Gangster Tobias Beckett, schickt ihn auf eine wichtige Mission. Begleitet wird Solo unter anderem von seinem neuen, treuen Freund Chewbacca, von Qi’Ra die ihn kennt wie kein anderer – und von Lando Calrissian."
      },
      {
        "id": 181812,
        "title": "Star Wars: Der Aufstieg Skywalkers",
        "originalTitle": "Star Wars: The Rise of Skywalker",
        "releaseYear": "2019",
        "posterPath": "/dAk1ClViS20eUEjfxjeknceMBi7.jpg",
        "backdropPath": "/auJKGst3vXpJozHZh4nMFs0xWIU.jpg",
        "voteAverage": 6.2,
        "overview": "Etwa ein Jahr, nachdem der letzte Rest des Widerstands durch Luke Skywalkers Opfertat aus dem Griff der Ersten Ordnung entkommen konnte, kämpfen die völlig unterlegenen Rebellen aus dem Hinterhalt gegen Kylo Ren und dessen Truppen. Zum ersten Mal gehen dabei die neuen Helden Rey, Finn und der Super-Pilot Poe gemeinsam auf eine lange Mission ..."
      }
    ]
  },
  {
    "id": "lord-of-the-rings",
    "name": "Der Herr der Ringe & Der Hobbit",
    "category": "franchise",
    "tagline": "Das monumentale Fantasy-Meisterwerk von Peter Jackson",
    "description": "Von Beutelsend nach Mordor: J.R.R. Tolkiens Mittelerde in atemberaubenden, 17-fach Oscar-prämierten Bildern.",
    "backdropPath": "/oiwc338EoBgS4sEI2ixAny4KQKg.jpg",
    "posterPath": "/k6lw7hhaMDzJ170bfZfBbnipxcW.jpg",
    "movies": [
      {
        "id": 120,
        "title": "Der Herr der Ringe - Die Gefährten",
        "originalTitle": "The Lord of the Rings: The Fellowship of the Ring",
        "releaseYear": "2001",
        "posterPath": "/k6lw7hhaMDzJ170bfZfBbnipxcW.jpg",
        "backdropPath": "/oiwc338EoBgS4sEI2ixAny4KQKg.jpg",
        "voteAverage": 8.5,
        "overview": "Dem Hobbit Bilbo Beutlin fällt zufällig ein machtvoller Ring in die kleinen Hände. Dieses Schmuckstück erlaubte es dem finsteren Herrscher Sauron einst, die Welt zu unterjochen. Der Ring schien über Jahrhunderte verloren, bis Bilbo ihn an sich nahm und seinen „Schatz“ sechzig Jahre lang bewahrte. An seinem 111. Geburtstag gibt er ihn schweren Herzens an seinen Neffen Frodo weiter und verlässt seine Heimat Mittelerde. Für den jungen Hobbit Frodo wird der Ring jedoch zur schweren Bürde. Der böse Geist Saurons, der in dem „Einen“ gefangen ist, wird immer stärker. Frodo bleibt nur eine Möglichkeit: Er muss ihn vernichten. Allerdings ist das nicht gerade einfach. Nur in den ewigen Feuern des Schicksalsberges im Lande Mordor, wo der Ring geschmiedet wurde, kann er auch vernichtet werden. Doch bis dahin muss Frodo an der Seite des Zauberers Gandalf und seiner Gefährten durch Feindesland ziehen, immer verfolgt von Saurons Lakaien …"
      },
      {
        "id": 121,
        "title": "Der Herr der Ringe - Die zwei Türme",
        "originalTitle": "The Lord of the Rings: The Two Towers",
        "releaseYear": "2002",
        "posterPath": "/tgBCeAjPwXeUaf8LsRL0LzBIcdR.jpg",
        "backdropPath": "/6G73mNyooWAEQTpckPSnFxFoNmc.jpg",
        "voteAverage": 8.4,
        "overview": "Der Weg der Gefährten hat sich geteilt. Ringträger Frodo und sein treuer Begleiter Sam treffen in den Bergen von Emyn Muil auf Gollum, dem einst Bilbo Beutlin den Einen Ring wegnahm. Gollums Versuch, den mächtigen Ring von Frodo zu stehlen, misslingt, doch die Hobbits bringen es nicht übers Herz, die Kreatur zu töten. Stattdessen soll Gollum die beiden nach Mordor an die Pforten von Barad-Dûr, Saurons Festung, führen, wo Frodo den Ring vernichten will. Währenddessen folgen Aragorn, Elben-Bogenschütze Legolas und Zwerg Gimli den Spuren der von Orks verschleppten Hobbits. Im Menschenkönigreich Rohan ersuchen sie Unterstützung. Doch König Theoden steht unter einem tödlichen Bann Saurons. Erst als Gandalf als wiedergeborener weißer Zauberer zurückkehrt, wendet sich das Blatt. Er befreit Theoden von dem Fluch und bringt die Menschen von Rohan hinter sich. Unterdessen rückt Saurons Verbündeter Saruman mit einer 10.000 Mann starken Armee von Uruk-hais in RIchtung der Menschenstadt vor..."
      },
      {
        "id": 122,
        "title": "Der Herr der Ringe - Die Rückkehr des Königs",
        "originalTitle": "The Lord of the Rings: The Return of the King",
        "releaseYear": "2003",
        "posterPath": "/uFjlP9U9UOZAzGB25HUtmlEpXbc.jpg",
        "backdropPath": "/ctiw6FZK4N36LmkjSklWEbuvlq9.jpg",
        "voteAverage": 8.5,
        "overview": "Saurons Heer will Minas Tirith angreifen, die in Felsen errichtete Hauptstadt von Gondor. Angesichts der Bedrohlichkeit des feindlichen Heeres wiegt es umso schwerer, dass Gondors König fehlt und nur der schwächliche Truchsess Denethor über das einst mächtige Königreich wacht. Wird Aragorn die Kraft aufbringen, jene Aufgabe zu übernehmen, für die sein Schicksal ihn bestimmt hat? Während Gandalf verzweifelt versucht, die mutlosen Kämpfer von Gondor zu motivieren, sammelt Théoden die Krieger von Rohan, um am Kampf teilzunehmen. Aber obwohl sie tapfer und leidenschaftlich Widerstand leisten, haben die Streitkräfte der Menschen dem überwältigenden Ansturm der feindlichen Legionen gegen das Königreich kaum etwas entgegenzusetzen. Jeder Sieg fordert große Opfer. Trotz der starken Verluste stellen sich die Gefährten der größten Schlacht ihres Lebens - vereint durch ein einziges Ziel: Sauron muss so lange abgelenkt werden, bis Frodo den Ring vernichtet hat..."
      },
      {
        "id": 49051,
        "title": "Der Hobbit - Eine unerwartete Reise",
        "originalTitle": "The Hobbit: An Unexpected Journey",
        "releaseYear": "2012",
        "posterPath": "/bPYCAzOB3M3PZ91BpQzJeReKkP8.jpg",
        "backdropPath": "/xyXmtuvsoM5J3yNad0nvcetpBdY.jpg",
        "voteAverage": 7.4,
        "overview": "Mit dem Besuch des weisen Zauberers Gandalf verändert sich das beschauliche Leben eines Hobbits für immer. Zögerlich schließt sich der unbedarfte Bilbo mit Gandalf der Mission von 13 mutigen Zwergen an, die ihr Reich zurückerobern wollen. Der furchterregende Drache Smaug, der es einst zerstörte, ist seit Jahrzehnten verschwunden. Doch ist das Monstrum wirklich tot und können die großen Gefahren dieses Abenteuers, darunter gefräßige Orks und wütende Trolle, wirklich von so kleinen Helden überwunden werden?"
      },
      {
        "id": 57158,
        "title": "Der Hobbit - Smaugs Einöde",
        "originalTitle": "The Hobbit: The Desolation of Smaug",
        "releaseYear": "2013",
        "posterPath": "/60O2sdzZcPX8vXyDOYHi7exrnil.jpg",
        "backdropPath": "/5ZYxL6k4ZHrEmrFvmY4HZVzerxG.jpg",
        "voteAverage": 7.6,
        "overview": "Die Gefährten haben den Beginn ihrer unerwarteten Reise überstanden – auf ihrem Weg gen Osten begegnen sie nun dem Hautwechsler Beorn und im trügerischen Düsterwald einem Schwarm gigantischer Spinnen. Sie werden von den gefährlichen Waldelben gefangen genommen, können aber entkommen, erreichen Seestadt und schließlich den Einsamen Berg selbst, wo sie sich der größten Gefahr stellen müssen – einem Monster, das alle bisherigen an Grässlichkeit übertrifft: Der Drache Smaug fordert nicht nur den ganzen Mut der Gefährten heraus, sondern stellt auch ihre Freundschaft auf eine harte Probe – bis sie sich schließlich fragen müssen, ob ihre Reise überhaupt noch einen Sinn ergibt."
      },
      {
        "id": 122917,
        "title": "Der Hobbit - Die Schlacht der fünf Heere",
        "originalTitle": "The Hobbit: The Battle of the Five Armies",
        "releaseYear": "2014",
        "posterPath": "/mNZ4MxL0KdW9VBMXSAhiiGFDYaa.jpg",
        "backdropPath": "/3UbaCMmqOd7mca4Y5DOzY2ZVTyX.jpg",
        "voteAverage": 7.3,
        "overview": "Nachdem Smaug besiegt wurde, sitzt Thorin endlich auf dem Zwergenthron und hat sein Reich wieder. Doch der Kampf gegen den Drachen hat Spuren hinterlassen. Die Stadt Esgaroth wurde zerstört, ihre Bewohner sind nun obdachlos. Doch Thorin verweigert jede Hilfe genauso wie die Rückgabe von Teilen des Schatzes, die Smaug gestohlen hatte. Hobbit Bilbo versucht zwischen Zwergen, Elben und den Bürgern zu vermitteln, doch vergeblich. Thorin hält ihn für einen Verräter und auch Gandalf kann nichts mehr ausrichten. Es wird aufgerüstet und bald stehen sich die Armeen gegenüber…"
      }
    ]
  },
  {
    "id": "indiana-jones",
    "name": "Indiana Jones",
    "category": "franchise",
    "tagline": "Hut, Peitsche und der legendärste Archäologe aller Zeiten",
    "description": "Dr. Henry Walton Jones Jr. auf weltweiter Jagd nach der Bundeslade, dem Heiligen Gral und verlorenen Geheimnissen.",
    "backdropPath": "/zPACwR32amTNvzId9qyapCWXYDJ.jpg",
    "posterPath": "/8cWx3s2Wfo15DzUyIE8scg3eNdb.jpg",
    "movies": [
      {
        "id": 85,
        "title": "Jäger des verlorenen Schatzes",
        "originalTitle": "Raiders of the Lost Ark",
        "releaseYear": "1981",
        "posterPath": "/8cWx3s2Wfo15DzUyIE8scg3eNdb.jpg",
        "backdropPath": "/zPACwR32amTNvzId9qyapCWXYDJ.jpg",
        "voteAverage": 7.9,
        "overview": "Der Archäologe Dr. Henry Jones wird von Regierungsagenten auf die Bundeslade angesetzt, das Behältnis, in dem Moses Gesetzestafeln aufbewahrt wurden. Laut Geheiminformationen suchen auch die Nazis nach der Lade, da sie den Besitzer unbesiegbar machen soll. Jones, genannt Indiana Jones, reist daraufhin nach Nepal, wo er einen alten Kollegen aufspüren will, jedoch nur dessen Tochter findet, die sich ihm anschließt. Ein altes Schmuckstück führt sie nach Ägypten, wo die Nazis mit Belloqs Hilfe bereits Ausgrabungen vornehmen. So kommt es zum Wettlauf um die Auffindung der Quelle der Seelen…"
      },
      {
        "id": 87,
        "title": "Indiana Jones und der Tempel des Todes",
        "originalTitle": "Indiana Jones and the Temple of Doom",
        "releaseYear": "1984",
        "posterPath": "/7NBTcdNtaTEYoKRP8VdXRgWO6rk.jpg",
        "backdropPath": "/f133nWlU6yUkZqqwcCXCbTEJWHr.jpg",
        "voteAverage": 7.3,
        "overview": "Indiana Jones kehrt zurück! Nachdem er bei der Erringung eines Diamanten in einem Nachtclub in Shanghai beinahe vergiftet, erdolcht und erschossen wurde, flieht er mit einer halbhysterischen Clubsängerin und seinem jungen asiatischen Freund Short Round mit einem Flugzeug. Doch über Indien wird auch hier ein Mordversuch gegen sie ausgeführt und alle drei müssen abspringen. Sie gelangen in ein Dorf, aus dem heilige Steine und sämtliche Kinder entführt wurden. Die Spur führt zu einem Fürstenpalast im Dschungel, wo sie einem machtgierigen Jungfürsten auf die Spur kommen, der die Kinder in den Minen arbeiten läßt. Doch hinter ihm steht ein noch machtvollerer Sektenführer..."
      },
      {
        "id": 89,
        "title": "Indiana Jones und der letzte Kreuzzug",
        "originalTitle": "Indiana Jones and the Last Crusade",
        "releaseYear": "1989",
        "posterPath": "/kaAhHlHv2SU7AK5xOMYzsqe2mrr.jpg",
        "backdropPath": "/7KGdTzKux4fp5sW7hUM33NWqBU1.jpg",
        "voteAverage": 7.9,
        "overview": "Wir schreiben das Jahr 1938: Doktor Jones wird vom Mäzen eines Museums beauftragt, den Heiligen Gral und somit die wichtigste Reliquie der Christenheit zu finden. Jones' Einwand, es würde der falsche Jones gefragt werden, denn der eigentliche Experte sei sein Vater Henry, fördert nur die Erkenntnis zu Tage, dass Jones senior bereits die Spur aufgenommen hatte, mittlerweile aber verschwunden ist. Nun ist des Doktors Jagdinstinkt geweckt. Besorgt um das Wohlergehen des Vaters und mit dem Museumskurator Marcus Brody im Gepäck tritt Jones eine Reise in die alte Welt an, um das zustande zu bringen, was die mittelalterlichen Kreuzzüge nicht geschafft hatten: den Kelch zu finden, der beim letzten Abendmahl gereicht worden war und das Blut Jesu am Kreuz aufgefangen hatte. Erwartungsgemäß ist aber nicht nur der Doktor auf der Suche - auch die Schergen Hitlers wollen sich die Sagen umwobenen Kräfte des Kelches sichern, verheißt er doch das ewige Leben…"
      },
      {
        "id": 217,
        "title": "Indiana Jones und das Königreich des Kristallschädels",
        "originalTitle": "Indiana Jones and the Kingdom of the Crystal Skull",
        "releaseYear": "2008",
        "posterPath": "/2ycEOvqsjdvKqQkybBtLUmcqxLK.jpg",
        "backdropPath": "/p96949hcwUG2BwE6MgKmw0uYNCx.jpg",
        "voteAverage": 6,
        "overview": "1957 in der Wüste Nevadas, der Kalte Krieg ist in vollem Gange und Indiana Jones den Russen in die Hände gefallen. Indy gelingt die Flucht, doch die Russen – unter der Führung von Irina Spalko, Stalins Lieblingsagentin und ihres Zeichens Parapsychologin, - entwenden ein mysteriöses Skelett, das offenbar in Verbindung mit dem Verschwinden von Indys altem Freund und Kollegen Harold Oxleys steht, der in Peru verschollen ist. Gemeinsam mit Oxleys Ziehsohn Mutt macht sich Indy im Dschungel des Amazonas auf die Suche nach dem legendären Kristallschädel, dem magische Kräfte nachgesagt werden und der Oxley offenbar in den Wahnsinn getrieben hat. Eine Schatzsuche auf Leben und Tod beginnt."
      },
      {
        "id": 335977,
        "title": "Indiana Jones und das Rad des Schicksals",
        "originalTitle": "Indiana Jones and the Dial of Destiny",
        "releaseYear": "2023",
        "posterPath": "/scZQqSJjHw4mdsz7YfIUvOaRi7O.jpg",
        "backdropPath": "/57JocxmicOoAMhkUSmdKBlpZWMT.jpg",
        "voteAverage": 6.5,
        "overview": "Indy befindet sich in einer neuen Ära und nähert sich dem Ruhestand. Er ringt damit, sich in eine Welt einzufügen, die über ihn hinausgewachsen zu sein scheint. Doch als die Tentakel eines allzu vertrauten Bösen in Form eines alten Rivalen zurückkehren, muss Indy erneut seinen Hut aufsetzen und seine Peitsche in die Hand nehmen, um sicherzustellen, dass ein uraltes und mächtiges Artefakt nicht in die falschen Hände gerät."
      }
    ]
  },
  {
    "id": "harry-potter",
    "name": "Harry Potter & Wizarding World",
    "category": "franchise",
    "tagline": "Willkommen an der Zauberschule Hogwarts",
    "description": "Die magische Reise von Harry, Hermine und Ron gegen Lord Voldemort und die Mächte der Finsternis.",
    "backdropPath": "/bfh9Z3Ghz4FOJAfLOAhmc3ccnHU.jpg",
    "posterPath": "/nKspzM3rVJASkT4CvZvuj9KDT7l.jpg",
    "movies": [
      {
        "id": 671,
        "title": "Harry Potter und der Stein der Weisen",
        "originalTitle": "Harry Potter and the Philosopher's Stone",
        "releaseYear": "2001",
        "posterPath": "/nKspzM3rVJASkT4CvZvuj9KDT7l.jpg",
        "backdropPath": "/bfh9Z3Ghz4FOJAfLOAhmc3ccnHU.jpg",
        "voteAverage": 7.9,
        "overview": "Harry Potter erfährt an seinem 11. Geburtstag, dass seine verstorbenen Eltern mächtige Zauberer waren und auch er selbst magische Kräfte besitzt. Als er von Hogwarts, der Schule für Hexerei und Zauberei, aufgenommen wird, erlebt Harry das Abenteuer seines Lebens. Er lernt Quidditch, das hoch in der Luft gespielt wird, und auf dem Weg, sich einem schwarzen Magier zu stellen, der ihn vernichten will, muss Harry eine spannende Schachpartie mit lebenden Figuren überstehen…"
      },
      {
        "id": 672,
        "title": "Harry Potter und die Kammer des Schreckens",
        "originalTitle": "Harry Potter and the Chamber of Secrets",
        "releaseYear": "2002",
        "posterPath": "/eZy8E8F85DXZX3yFk2bYzMNYJKG.jpg",
        "backdropPath": "/zuYEvft5fuzBDOeq4ClYpiu9LlO.jpg",
        "voteAverage": 7.7,
        "overview": "Harry Potter könnte sich schönere Sommerferien vorstellen: Einerseits erträgt er nur schwer den herrischen Ton im Haus von Tante Petunia und Onkel Vernon Dursley, denen seine Zauberkunst nicht geheuer ist, andererseits haben ihn seine besten Freunde Ron Weasley und Hermine Granger offenbar vergessen, denn sie beantworten keinen seiner Briefe. Plötzlich taucht der geheimnisvolle Haus-Elf Dobby in Harrys Schlafzimmer auf und warnt ihn: Falls Harry nach Hogwarts zurückkehrt, schwebt er in großer Gefahr. Dobby will den jungen Gryffindor unbedingt davon abhalten, weiter auf die Schule für Hexerei und Zauberei zu gehen – deswegen hat er dafür gesorgt, dass Rons und Hermines Briefe nicht ankommen. Doch was der boshafte Elf auch anstellt – Harry lässt sich nicht beirren."
      },
      {
        "id": 673,
        "title": "Harry Potter und der Gefangene von Askaban",
        "originalTitle": "Harry Potter and the Prisoner of Azkaban",
        "releaseYear": "2004",
        "posterPath": "/ea3aGUyIFhvd4EqZKX5TkWzd9ml.jpg",
        "backdropPath": "/htmYEfH7TQgzsXHCnNXxmoYKQtL.jpg",
        "voteAverage": 8,
        "overview": "Während die abscheuliche Tante Magda über den Nachthimmel schwebt, kehrt Harry nach Hogwarts zurück, um sein drittes Ausbildungsjahr zu beginnen. Eine haarsträubende Busreise im Fahrenden Ritter bringt ihn zur Winkelgasse, wo er erfährt, dass der flüchtige Sträfling Sirius Black hinter ihm her ist. So beginnt das neue Schuljahr. In Hogwarts lernen Harry und seine Freunde die schwierige Kunst, mit einem Hippogreif umzugehen, die ständig ihre Gestalt verändernden Irrwichte in lustige Formen zu verwandeln und sogar die Zeit zurückzudrehen. Die Seelen aussaugenden Dementoren belauern die Schule und bedrohen Harry, während Der-dessen-Name-nicht-genannt-werden-darf einen Spitzel in der Burg untergebracht hat. Und Harry muss es mit allen aufnehmen."
      },
      {
        "id": 674,
        "title": "Harry Potter und der Feuerkelch",
        "originalTitle": "Harry Potter and the Goblet of Fire",
        "releaseYear": "2005",
        "posterPath": "/y3n0fN5uL417gd6LVtReKbYowIt.jpg",
        "backdropPath": "/cClWTo3ftVXvV1sF8vlLuWfnlph.jpg",
        "voteAverage": 7.8,
        "overview": "Das große Abenteuer beginnt, als der Feuerkelch Harry Potters Namen freigibt und Harry damit Teilnehmer eines gefährlichen Wettbewerbs unter drei ruhmreichen Zauberschulen wird – des Trimagischen Turniers. Wer aber könnte Harrys Namen in den Feuerkelch geworfen haben? Jetzt muss er einen gefährlichen Drachen bezwingen, mit gespenstischen Wasserdämonen kämpfen und einem verzauberten Labyrinth entkommen – nur, um am Ende Dem-dessen-Name-nicht-genannt-werden-darf gegenüberzustehen."
      },
      {
        "id": 675,
        "title": "Harry Potter und der Orden des Phönix",
        "originalTitle": "Harry Potter and the Order of the Phoenix",
        "releaseYear": "2007",
        "posterPath": "/4Hg0ut5IcaTVGa4OR5Rhjak6R7H.jpg",
        "backdropPath": "/9svsJni0pNROt53QBEj9JqZMuEK.jpg",
        "voteAverage": 7.7,
        "overview": "Nach seinem letzten Abenteuer, das mit der dramatischen Rückkehr seines Erzfeindes Lord Voldemort endete, hat Harry Potter wieder der graue Alltag empfangen. Wie üblich muss er auch diese Sommerferien wieder bei seinen verhassten Verwandten, den Dursleys, verbringen. Das ändert sich jedoch schlagartig, als Harry eines Abends zusammen mit seinem Cousin Dudley von zwei Dementoren angegriffen wird. Er kann diese zwar mit Hilfe eines Zaubers vertreiben, handelt sich hierdurch aber ungerechterweise eine Vorladung vor das Zaubereigericht ein, da er in Gegenwart der Menschen gezaubert hat."
      },
      {
        "id": 767,
        "title": "Harry Potter und der Halbblutprinz",
        "originalTitle": "Harry Potter and the Half-Blood Prince",
        "releaseYear": "2009",
        "posterPath": "/bQNaLipvCgPvbXnyrJcGVOQyifD.jpg",
        "backdropPath": "/mITJS77BV4TSqdFB5FPGBc7JKXj.jpg",
        "voteAverage": 7.7,
        "overview": "Der Zauber der Liebe beherrscht das sechste Schuljahr von Harry und seinen besten Freunden Hermine und Ron. Hormone und ein Liebestrank des neuen Professors Horace Slughorn sorgen für Gefühlsverwirrung, während sich die Anhänger Voldemorts mit Unterstützung von Severus Snape zu Attacken auf die jungen Helden und ihren größten magischen Verbündeten formieren. Als Harry und Professor Dumbledore das Geheimnis für Voldemorts ewiges Leben entdecken, hat der dunkle Lord bereits den Tod nach Hogwarts entsandt."
      },
      {
        "id": 12444,
        "title": "Harry Potter und die Heiligtümer des Todes - Teil 1",
        "originalTitle": "Harry Potter and the Deathly Hallows: Part 1",
        "releaseYear": "2010",
        "posterPath": "/lwkSGuc2A6G69UtGotpADTaK6vQ.jpg",
        "backdropPath": "/5i2QAYnbN5vOZUUolLPYHTb9spe.jpg",
        "voteAverage": 7.7,
        "overview": "Harry sieht sich einer vollkommen veränderten Welt gegenüber. Die Todesser haben das Zauberministerium unter ihre Kontrolle gebracht und es tobt ein offener Kampf zwischen den Mächten des Guten und Bösen. Harry hat sich mit Hermine und Ron auf die Suche nach den “Horkruxen“ gemacht, magischen Objekten, die die Unsterblichkeit von Lord Voldemort garantieren und zerstört werden müssen. Der dunkle Lord hat seinerseits ein Kopfgeld auf Harry ausgesetzt, denn er will sich das Vergnügen den “Jungen der überlebte“ mit den eigenen Händen zu töten, nicht nehmen lassen. Unterdessen stößt Harry auf die Legende von den Heiligtümern des Todes, die ihm im Kampf gegen seinen Erzfeind das Leben retten könnte. Und so strebt alles unaufhaltsam der finalen Konfrontation zwischen den beiden Magiern entgegen, auf die Harry sich seit Beginn seiner Schullaufbahn vorbereitet hat."
      },
      {
        "id": 12445,
        "title": "Harry Potter und die Heiligtümer des Todes - Teil 2",
        "originalTitle": "Harry Potter and the Deathly Hallows: Part 2",
        "releaseYear": "2011",
        "posterPath": "/AmcYjc7HtNGnelhCU2YYbbVdtBH.jpg",
        "backdropPath": "/eKUk4oN4ucwnLJml7wRnjuB9AQH.jpg",
        "voteAverage": 8.1,
        "overview": "Das Ende ist nah! Hogwarts hat als Zuflucht ausgedient, Voldemorts Schergen haben die Macht über ganz England an sich gerissen. Harry, Ron und Hermine sind auf der Flucht, die Lage scheint aussichtslos. Eine letzte Chance bleibt dem Trio noch, das Blatt zu wenden und die Welt der Menschen vor dem Untergang zu bewahren: Sie müssen die legendären Heiligtümer des Todes finden. Nur mit diesen magischen Artefakten kann Voldemort noch besiegt werden. Doch die Freunde haben keinen Schimmer, wo sich die vor langer Zeit verschollenen Objekte befinden..."
      }
    ]
  },
  {
    "id": "steven-spielberg",
    "name": "Steven Spielberg Collection",
    "category": "director",
    "tagline": "Der Architekt des modernen Blockbuster-Kinos",
    "description": "Von emotionalen Meisterwerken wie Schindlers Liste bis zu bahnbrechenden Klassikern wie Jurassic Park und E.T.",
    "backdropPath": "/i1yf91svRHX45l9BXL8rVFzLoPH.jpg",
    "posterPath": "/jkchPeYVLZkGg40Co7t3FC0FUti.jpg",
    "movies": [
      {
        "id": 578,
        "title": "Der weiße Hai",
        "originalTitle": "Jaws",
        "releaseYear": "1975",
        "posterPath": "/jkchPeYVLZkGg40Co7t3FC0FUti.jpg",
        "backdropPath": "/i1yf91svRHX45l9BXL8rVFzLoPH.jpg",
        "voteAverage": 7.7,
        "overview": "Ein weißer Hai terrorisiert eine Badeinsel an der amerikanischen Atlantikküste. Besonnene Einheimische unter Führung von Polizeichef Brody wollen alle Strände schließen und zur großen Jagd blasen, während die Schar der Kaufleute und Gastwirte angesichts der einträglichen Badesaison lieber zur Tagesordnung übergeht und sich damit auch durchsetzt. Als der Hai erneut zuschlägt, bildet Brody mit dem erfahrenen Haifänger Quint und dem Ozeanologen Hooper ein Jagd-Team und rückt dem Gegner auf See zu Leibe."
      },
      {
        "id": 85,
        "title": "Jäger des verlorenen Schatzes",
        "originalTitle": "Raiders of the Lost Ark",
        "releaseYear": "1981",
        "posterPath": "/8cWx3s2Wfo15DzUyIE8scg3eNdb.jpg",
        "backdropPath": "/zPACwR32amTNvzId9qyapCWXYDJ.jpg",
        "voteAverage": 7.9,
        "overview": "Der Archäologe Dr. Henry Jones wird von Regierungsagenten auf die Bundeslade angesetzt, das Behältnis, in dem Moses Gesetzestafeln aufbewahrt wurden. Laut Geheiminformationen suchen auch die Nazis nach der Lade, da sie den Besitzer unbesiegbar machen soll. Jones, genannt Indiana Jones, reist daraufhin nach Nepal, wo er einen alten Kollegen aufspüren will, jedoch nur dessen Tochter findet, die sich ihm anschließt. Ein altes Schmuckstück führt sie nach Ägypten, wo die Nazis mit Belloqs Hilfe bereits Ausgrabungen vornehmen. So kommt es zum Wettlauf um die Auffindung der Quelle der Seelen…"
      },
      {
        "id": 601,
        "title": "E.T. – Der Außerirdische",
        "originalTitle": "E.T. the Extra-Terrestrial",
        "releaseYear": "1982",
        "posterPath": "/mNbBxa6pNxr4tmOQTGzj9eBuivZ.jpg",
        "backdropPath": "/mXLVA0YL6tcXi6SJSuAh9ONXFj5.jpg",
        "voteAverage": 7.5,
        "overview": "Der junge Elliott traut seinen Augen kaum, als er in einem Schuppen einen kleinen Ausserirdischen findet. Der schrumpelige Kobold musste bei einem Erkundungsflug von seinen Kollegen auf der Erde zurückgelassen werden, weil sie in Gefahr gerieten, von Menschen entdeckt zu werden. Elliot versucht, seinen neuen Freund vor den Wissenschaftlern der Regierung zu verstecken, denn der will seine weit entfernten Verwandten anfunken. Doch E.T. wird vor Heimweh immer schwächer."
      },
      {
        "id": 424,
        "title": "Schindlers Liste",
        "originalTitle": "Schindler's List",
        "releaseYear": "1993",
        "posterPath": "/lJiLP05Pm72fVEKVH3Z2bNNYHQv.jpg",
        "backdropPath": "/zb6fM1CX41D9rF9hdgclu0peUmy.jpg",
        "voteAverage": 8.6,
        "overview": "Von einer wahren Begebenheit inspiriert, erzählt Schindlers Liste die Geschichte des Industriellen Oskar Schindler, der während des Zweiten Weltkriegs versucht, sich in Krakau eine Existenz aufzubauen. Aus finanziellen Gründen beschäftigt er nur Juden und leiht sich Geld von ihnen um eine Emaillefabrik zu gründen, die ihm letztlich großen Reichtum beschert. Als die Brutalität des Holocaust Krakau erreicht, riskiert er nicht nur sein Vermögen, sondern auch sein Leben um seine Arbeiter vor der Deportation zu bewahren."
      },
      {
        "id": 329,
        "title": "Jurassic Park",
        "originalTitle": "Jurassic Park",
        "releaseYear": "1993",
        "posterPath": "/zgvLWNSKBrufJM8OAtVxJ2s7Nf8.jpg",
        "backdropPath": "/4SyDTF02R5BepqSdQmOaNCHObzF.jpg",
        "voteAverage": 8,
        "overview": "John Hammond, ein reicher Unternehmer, errichtet auf einer einsamen Insel heimlich einen Erlebnispark, der für seine Gäste außergewöhnliche Attraktionen bereithält. Es ist gelungen, aus einer urzeitlichen DNA leibhaftige Dinosaurier ins Leben zu rufen. Bevor der Park für das Publikum geöffnet wird, lädt er einen führenden Paläontologen, dessen Freundin, eine Paläobotanikerin, einen berühmten Mathematiker und seine beiden wißbegierigen Enkel ein, um die besorgten Investoren zu beruhigen. Aber der Besuch seiner ersten Gäste verläuft alles andere als nach Plan. Die urzeitlichen Monster brechen aus, entziehen sich jeder Kontrolle und starten eine mörderische Jagd auf ihre Schöpfer ..."
      },
      {
        "id": 857,
        "title": "Der Soldat James Ryan",
        "originalTitle": "Saving Private Ryan",
        "releaseYear": "1998",
        "posterPath": "/g0QGqHG2fjaIyWLtKWMqleGD27o.jpg",
        "backdropPath": "/rW2xRFlJRbTnBJlQTSjQmjevIwb.jpg",
        "voteAverage": 8.2,
        "overview": "Aus der Sicht einer Einheit amerikanischer Soldaten beginnt der Film am Tag der historischen D-Day-Invasion des 2. Weltkrieges mit der Landung am Strand. Von hier aus startet die Einheit zu einem gefährlichen Sonderauftrag: Captian John Miller muss mit seinen Männern hinter die feindlichen Linien dringen, um den Gefreiten James Ryan zu finden, dessen drei Brüder auf dem Schlachtfeld gestorben sind. Angesichts dieser schier unlösbaren Aufgabe beginnen die Männer an ihren Befehlen zu zweifeln. Warum acht Leben riskieren, um eines zu retten ? Umgeben von der brutalen Realität des Krieges sucht jeder nach seiner eigenen Antwort. Und sie suchen nach der Stärke, über die unsichere Zukunft mit Ehre, Anstand und Mut zu triumphieren."
      },
      {
        "id": 640,
        "title": "Catch Me If You Can",
        "originalTitle": "Catch Me If You Can",
        "releaseYear": "2002",
        "posterPath": "/bJLrws4RmIw6UdXQJ6Ok4UOvKo0.jpg",
        "backdropPath": "/eS3xZQ1C8lt6mm4K5lTmjbYn2HE.jpg",
        "voteAverage": 8,
        "overview": "Frank W. Abagnale war nicht nur als Arzt und Rechtsanwalt erfolgreich, sondern auch als Copilot einer großen Fluglinie. Das alles erreichte er vor seinem 21. Geburtstag. Er ist ein Meister der Täuschung, aber auch ein brillanter Fälscher. Durch geschickte Scheckbetrügereien ist er zu einem Vermögen von mehreren Millionen Dollar gekommen. FBI-Agent Carl Hanratty hat ihn schon länger im Visier und macht sich zur Aufgabe, Frank zu fassen und vor Gericht zu bringen. Frank ist ihm jedoch immer einen Schritt voraus und macht sich einen Spaß daraus, seinem Verfolger kleine Köder vorzuwerfen, damit die Jagd weiter geht…"
      },
      {
        "id": 180,
        "title": "Minority Report",
        "originalTitle": "Minority Report",
        "releaseYear": "2002",
        "posterPath": "/pW1k71rXEZoXESdg9OTuorEDfvV.jpg",
        "backdropPath": "/PrMb3oeEluauy0q9ZO5xL33A6C.jpg",
        "voteAverage": 7.4,
        "overview": "Im Washington, D.C., des Jahres 2054 gibt es keine Morde mehr. Die Zukunft ist bekannt und Mörder werden gefasst, bevor sie ihr Verbrechen begehen können. Dafür sorgt Pre-Crime, eine Elite-Einheit der Polizei, die die Visionen der Pre-Cogs, drei Wesen mit hellseherischen Fähigkeiten, auswertet und zur Tat schreitet. Das System ist perfekt. Und John Anderton ist sein perfekter Chef: Seit einem tragischen Verlust sechs Jahre zuvor widmet er sein Leben mit vollkommener Leidenschaft der Verbrecherjagd. Es gibt keinen Grund für ihn, am System zu zweifeln bis er in einer Vision selbst als Mörder zu sehen ist. 36 Stunden bleiben ihm bis zu dem Verbrechen. 36 Stunden, um zu beweisen, dass er unschuldig ist und das perfekte System fehlbar. Die Flucht kann beginnen."
      },
      {
        "id": 333339,
        "title": "Ready Player One",
        "originalTitle": "Ready Player One",
        "releaseYear": "2018",
        "posterPath": "/cJjXsV0gfntLfCFOznFfg0338UX.jpg",
        "backdropPath": "/5a7lMDn3nAj2ByO0X1fg6BhUphR.jpg",
        "voteAverage": 7.6,
        "overview": "Im Jahr 2045 steht die ökologisch ausgebeutete Welt am Rande des endgültigen Zusammenbruchs. Doch die Menschen finden Erlösung in dem gigantischen virtuellen Universum Oasis, das der geniale James Halliday entwickelt hat. Als Halliday stirbt, hinterlässt er sein ungeheures Vermögen der ersten Person, die jenes Easter Egg findet, das er in der Oasis versteckt hat. So beginnt ein Wettstreit, der die gesamte Welt in Atem hält. Der junge Wade Watts findet wider Erwarten erste Hinweise, und schon gerät er in eine halsbrecherische, realitätsverändernde Schatzjagd durch ein ebenso fantastisches wie geheimnisvolles Universum voller Entdeckungen und Gefahren ..."
      },
      {
        "id": 804095,
        "title": "Die Fabelmans",
        "originalTitle": "The Fabelmans",
        "releaseYear": "2022",
        "posterPath": "/3LtfEiFtc2Tb6i2v5HL3TRq5Snb.jpg",
        "backdropPath": "/xQyGkQ8ICa4lgifGr3oZjkm3AJ2.jpg",
        "voteAverage": 7.5,
        "overview": "Der junge Sammy wächst in der Nachkriegszeit in Arizona, USA, auf. Sein größter Wunsch ist es, eines Tages ein berühmter und erfolgreicher Filmregisseur zu werden. Wird es ihm gelingen, seinen Traum zu erfüllen?"
      }
    ]
  },
  {
    "id": "christopher-nolan",
    "name": "Christopher Nolan Meisterwerke",
    "category": "director",
    "tagline": "Mindfuck, Zeitreisen und monumentales Kino",
    "description": "Komplexe Zeitebenen, praktische Effekte und packende Dramaturgie von Memento bis Oppenheimer.",
    "backdropPath": "/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
    "posterPath": "/qaXfDrZCdd3wix2XYor5HDDpFrT.jpg",
    "movies": [
      {
        "id": 77,
        "title": "Memento",
        "originalTitle": "Memento",
        "releaseYear": "2000",
        "posterPath": "/qaXfDrZCdd3wix2XYor5HDDpFrT.jpg",
        "backdropPath": "/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
        "voteAverage": 8.2,
        "overview": "Leonard Shelby hat bei einem Unfall sein Kurzeitgedächtnis verloren. Zwar weiß er, wer er ist, doch er kann sich keine Namen, keine Begegnungen länger als ein paar Minuten merken. Sein Leben besteht aus einem Berg Notizen, Fotos und Tätowierungen, mit denen sein Körper übersät ist. Der Film beginnt mit einem Mord, festgehalten auf einem Polaroid. Der einzige Hinweis, dass Shelby den Mord begangen hat. Ein Mann ohne Gedächtnis kann von seiner Umwelt leicht missbraucht werden. Shelby versucht aus dem Wirrwarr von Notizen und Fotos das Geschehen zu entschlüsseln. Wenn er vor dem Spiegel steht, sieht er die Tätowierung: Finde den Mörder deiner Frau. Töte ihn."
      },
      {
        "id": 272,
        "title": "Batman Begins",
        "originalTitle": "Batman Begins",
        "releaseYear": "2005",
        "posterPath": "/b3UIToGx8JIpRqUTGkaoyaNLuU3.jpg",
        "backdropPath": "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
        "voteAverage": 7.7,
        "overview": "Wie wurde Bruce Wayne zu Batman? Als kleiner Junge musste Bruce Wayne mit ansehen, wie seine Eltern auf grauenhafte Weise umgebracht wurden. Deshalb kümmert sich der Butler Alfred Pennyworth um ihn und zieht ihn groß.Eines Tages macht er sich in aller Welt auf die Suche nach einem Weg, die Ungerechtigkeit zu bekämpfen. Als er nach seiner Reise wieder in seine Heimatstadt Gotham City zurückkehrt, muss er feststellen, dass die Verbrechensrate deutlich angestiegen ist. Dieser Umstand und der Drang nach Rache am Mord seiner Eltern treiben ihn langsam aber sicher dazu, sich Kampftechniken beizubringen und ein Fledermauskostüm zu entwerfen, mit deren Hilfe er Nacht für Nacht die Kriminellen der Stadt zur Strecke bringt - als Batman."
      },
      {
        "id": 1124,
        "title": "Prestige - Die Meister der Magie",
        "originalTitle": "The Prestige",
        "releaseYear": "2006",
        "posterPath": "/rN2eGbRpbJw8ZFVDiQfDxsknirP.jpg",
        "backdropPath": "/yaExZh6qE2cfyK3o4kAMEq0mkgy.jpg",
        "voteAverage": 8.2,
        "overview": "Im viktorianischen Zeitalter, zur Zeit der Jahrhundertwende, lernen sich die konkurrierenden Magier Robert Angier und Alfred Borden kennen. Aus freundschaftlicher, jugendlicher Konkurrenz erwächst jedoch bald etwas wesentlich Schlimmeres, denn nicht nur neidet jeder dem Anderen das Talent, Roberts Frau stirbt auch bei einem von Alfreds risikobewehrten Tricks. Über Jahre belauern und bekämpfen sie sich gegenseitig und reißen damit ihr gesamtes Umfeld in die Tiefe, nur um hinter die Tricks des jeweils anderen zu kommen. Dabei schrecken die beiden am Ende nicht einmal vor Mord zurück, denn das \"Prestige\", der unglaubliche letzte Teil eines perfekten Zaubertricks, ist jeden Einsatz wert..."
      },
      {
        "id": 155,
        "title": "The Dark Knight",
        "originalTitle": "The Dark Knight",
        "releaseYear": "2008",
        "posterPath": "/z1DfRQf2CgnROyhVZ6ch8FbWt71.jpg",
        "backdropPath": "/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        "voteAverage": 8.5,
        "overview": "Gemeinsam mit Bezirksstaatsanwalt Harvey Dent und Lieutenant James Gordon versucht der im Fledermauskostüm agierende Milliardär Bruce Wayne dem Verbrechen in Gotham City Einhalt zu gebieten. Wie aus dem Nichts taucht plötzlich ein psychotischer Superverbrecher auf - der Joker. In seiner wahnhaften Vision möchte er die Stadt in Chaos und Anarchie stürzen und Batman scheint der einzige, der ihn stoppen kann. Bis es zum endgültigen Show-Down kommt, wird aber viel Blut fließen und auch Menschen die Bruce Wayne nahe stehen, könnten Opfer werden."
      },
      {
        "id": 27205,
        "title": "Inception",
        "originalTitle": "Inception",
        "releaseYear": "2010",
        "posterPath": "/t5WUY5ZSxwVIVExaMZmmIj88BKA.jpg",
        "backdropPath": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "voteAverage": 8.4,
        "overview": "Beim Versuch in das Unterbewusstsein des Industriellen Saito einzudringen, stoßen Cobb und seine Mitstreiter auf unerwartete Schwierigkeiten. Saito hatte Verteidigungsstrategien gegen den Gedankendiebstahl trainiert und baut nun einen Abwehrriegel auf, doch erst der Verrat eines Kollegen lässt den Versuch scheitern, dem Schlafenden Geheimnisse zu entlocken. Da seine Auftraggeber unbedingten Erfolg gefordert hatten, muss Cobb, der auf Grund einer drohenden Verurteilung nicht mehr in die USA zurück kann, fliehen, doch Saito kommt ihm zuvor. Allerdings nicht um ihn zu bestrafen, sondern um ihm einen Deal vorzuschlagen."
      },
      {
        "id": 49026,
        "title": "The Dark Knight Rises",
        "originalTitle": "The Dark Knight Rises",
        "releaseYear": "2012",
        "posterPath": "/9NyCuhyvFKTqGRLcr4r8fWXnu9v.jpg",
        "backdropPath": "/c3OHQncTAnKFhdOTX7D3LTW6son.jpg",
        "voteAverage": 7.8,
        "overview": "Nach dem Tod des Staatsanwalts Harvey Dent alias Two-Face nahm Batman die Schuld von dessen Verbrechen auf sich, um seinen Ruf zu schützen. Daher wurde er von dem Gotham City Police Department gejagt und verließ die Stadt. Die Handlung des Films setzt acht Jahre nach den Ereignissen von The Dark Knight ein. Nachdem der bemerkbar gealterte Batman nach Gotham zurückkehrt, muss er die Wahrheit der geheimnisvollen Selina Kyle herausfinden und den Schurken Bane davon abhalten, Gotham zu zerstören"
      },
      {
        "id": 157336,
        "title": "Interstellar",
        "originalTitle": "Interstellar",
        "releaseYear": "2014",
        "posterPath": "/hHdhfkkzt0Mwec33Ux177Z7CO8w.jpg",
        "backdropPath": "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
        "voteAverage": 8.5,
        "overview": "Was Wissenschaftler, Politiker und Aktivisten seit Jahrzehnten prophezeien, ist eingetreten: Die Menschheit steht kurz davor, an einer globalen Nahrungsknappheit zugrunde zu gehen. Die einzige Hoffnung der Weltbevölkerung besteht in einem geheimen Projekt der US-Regierung, das von dem findigen Wissenschaftler Professor Brand geleitet wird. Der Plan sieht vor, eine Expedition in ein anderes Sternensystem zu starten, wo bewohnbare Planeten, Rohstoffe und vor allem Leben vermutet werden. Der Ingenieur und ehemalige NASA-Pilot Cooper und Brands Tochter Amelia führen die Besatzung an, die sich auf eine Reise ins Ungewisse begibt: Wurmlöcher sind so gut wie unerforscht und niemand kann mit Sicherheit sagen, was die Crew auf der anderen Seite erwartet. Ebenso ist unsicher, ob und wann Cooper und Brand wieder auf die Erde zurückkehren. Coopers Kinder, Tochter Murph und Sohn Tom, müssen mit Schwiegervater Donald zurückbleiben und auf seine Wiederkehr hoffen..."
      },
      {
        "id": 374720,
        "title": "Dunkirk",
        "originalTitle": "Dunkirk",
        "releaseYear": "2017",
        "posterPath": "/pcVC6wvEVodaUxkTsUkXlgVrXHF.jpg",
        "backdropPath": "/pTwF9hLkqAtuOqXMdOyPwz4AgnI.jpg",
        "voteAverage": 7.5,
        "overview": "Mai 1940, der Zweite Weltkrieg tobt: Die Nazis haben die französische Hafenstadt Dünkirchen eingekesselt und verdeutlichen den Bewohnern und den 400.000 dort stationierten Soldaten mit Flugblättern die scheinbar ausweglose Lage. Denn durch die feindlichen Truppen auf der einen Seite und das Wasser auf der anderen scheint es keine Chance auf Überleben zu geben. Doch in Großbritannien ersinnt man eine kühne Rettungsmission, von der zuerst nur die wenigsten glauben, dass sie Aussicht auf Erfolg haben kann: Während die eingekesselten Soldaten, darunter Tommy, Alex und Gibson, am Boden ums Überleben kämpfen, sorgen RAF-Piloten wie Farrier in ihren Spitfires für Feuerschutz aus der Luft. Gleichzeitig eilen Zivilisten wie Mr. Dawson den eingekesselten Soldaten mit ihren kleinen Booten übers Wasser zu Hilfe."
      },
      {
        "id": 577922,
        "title": "Tenet",
        "originalTitle": "Tenet",
        "releaseYear": "2020",
        "posterPath": "/jutsxphSGbnpxpGr23xzbf2ziQZ.jpg",
        "backdropPath": "/mQOUyqDybTqxl73hO5LujCZsM1o.jpg",
        "voteAverage": 7.2,
        "overview": "Ein CIA-Agent wird rekrutiert, um einen besonderen Auftrag auszuführen. Er soll den Dritten Weltkrieg verhindern. Es muss eine Person gestoppt werden, die die Fähigkeit besitzt, die Zeit zu manipulieren. Von einer Wissenschaftlerin erfährt er, dass es Menschen in der Zukunft gelingen wird, die Entropie von Objekten umzukehren, sodass diese Objekte temporal invertieren. So werden Kugeln mit Schusswaffen nicht abgeschossen, sondern aufgefangen. Immer mehr solcher Objekte werden gefunden."
      },
      {
        "id": 872585,
        "title": "Oppenheimer",
        "originalTitle": "Oppenheimer",
        "releaseYear": "2023",
        "posterPath": "/9AiHV08v8RyyuHcO5wuTaTXBxfe.jpg",
        "backdropPath": "/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
        "voteAverage": 8,
        "overview": "Als dem Physiker Julius Robert Oppenheimer während des Zweiten Weltkriegs die wissenschaftliche Leitung des Manhattan-Projekts übertragen wird, können er und seine Ehefrau Kitty sich nicht vorstellen, welche Auswirkungen Oppenheimers Arbeit nicht nur auf ihr Leben, sondern auf die ganze Welt haben wird. Im Los Alamos National Laboratory in New Mexico sollen er und sein Team unter der Aufsicht von Lt. Leslie Groves eine Nuklearwaffe entwickeln – was ihnen auch gelingt. Oppenheimer wird zum „Vater der Atombombe“ ausgerufen, doch dass seine tödliche Erfindung bald folgenschwer in Hiroshima und Nagasaki eingesetzt wird, lässt Oppenheimer Abstand von dem Projekt nehmen. Als der Krieg zu Ende geht, setzt sich Robert Oppenheimer als Berater der US-amerikanischen Atomenergiebehörde, die von Lewis Strauss mitbegründet wurde, für eine internationale Kontrolle von Kernenergie und gegen ein nukleares Wettrüsten ein – und gerät ins Visier des FBI."
      }
    ]
  },
  {
    "id": "quentin-tarantino",
    "name": "Quentin Tarantino Collection",
    "category": "director",
    "tagline": "Kult-Dialoge, Blut und unverwechselbarer Style",
    "description": "Nicht-lineare Erzählweisen, ikonische Soundtracks und unvergessliche Charaktere.",
    "backdropPath": "/jwt159hXWA9Q5xpBo8hWb3zwLi7.jpg",
    "posterPath": "/AdXZmqOq2XcJQvHN3nKIXTd6ilq.jpg",
    "movies": [
      {
        "id": 500,
        "title": "Reservoir Dogs - Wilde Hunde",
        "originalTitle": "Reservoir Dogs",
        "releaseYear": "1992",
        "posterPath": "/AdXZmqOq2XcJQvHN3nKIXTd6ilq.jpg",
        "backdropPath": "/jwt159hXWA9Q5xpBo8hWb3zwLi7.jpg",
        "voteAverage": 8.1,
        "overview": "Ein perfekt geplanter Coup endet in einem rücksichtslosen Psycho-Horrortrip, der blutige Opfer fordert. Beteiligt sind sechs elegant gekleidete Profi-Gangster, die zu einem Überfall auf ein Juweliergeschäft zusammenkommen. Alles, was die Gentlemen voneinander wissen, sind die Decknamen, die ihnen ihr Auftraggeber Joe Cabot gegeben hat. Mr. White, Mr. Orange, Mr. Pink, Mr. Blonde, Mr. Blue, Mr. Brown. Doch der todsichere Coup misslingt, die Polizei war informiert. Am geheimen Treffpunkt, einem leerstehenden Lagerhaus, wird ein Verdacht zur Gewissheit: unter ihnen ist ein Spitzel. Tödliches Misstrauen macht sich breit. Während einer der Gangster zu verbluten droht, entwickeln sich die anderen zu reißenden Bestien, die weder vor der Folter an einem gekidnappten Polizisten noch vor blutiger Gewalt untereinander zurückschrecken."
      },
      {
        "id": 680,
        "title": "Pulp Fiction",
        "originalTitle": "Pulp Fiction",
        "releaseYear": "1994",
        "posterPath": "/hOg9USqmQmglmr5kGvpyg1XkhqN.jpg",
        "backdropPath": "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
        "voteAverage": 8.5,
        "overview": "Vincent Vega und Jules Winnfield holen für ihren Boss Marsellus Wallace eine schwarze Aktentasche aus einer Wohnung ab. Drei Jungs, die ihnen dabei im Weg stehen, lassen ihr Leben. Die Killer machen sich mit einem vierten Jungen als Geisel auf den Weg ins Hauptquartier. Doch als das Auto über eine Straßenerhöhung schaukelt, erschießt Vincent aus Versehen die Geisel. Um den blutverspritzten Wagen zu reinigen, machen die beiden einen Abstecher zu Jules's Freund Jimmie, wo auf Befehl vom Boss ein Spezialist für schwierige Aufträge zu ihnen stößt: The Wolf..."
      },
      {
        "id": 24,
        "title": "Kill Bill - Volume 1",
        "originalTitle": "Kill Bill: Vol. 1",
        "releaseYear": "2003",
        "posterPath": "/blQvG2f7Lm8DFOn4lAfAZ1zEHVG.jpg",
        "backdropPath": "/iffzIhuLAO38Po6sh1s6ZEVwlNL.jpg",
        "voteAverage": 8,
        "overview": "Es sollte der Aufbruch in ein neues Leben werden, doch es endete mit dem Tod: Die Killer O-Ren Ishii, Vernita Green, Budd und Elle Driver haben die Hochzeit ihrer Ex-Kollegin – im Film nur „die Braut“ genannt – in ein Massaker verwandelt. Wider Erwarten überlebt die geschändete Frau jedoch und will von nun an nichts weiter als Rache. Rache an dem Todeskommando, das sie liquidieren sollte und Rache an dem Mann, der den Auftrag dazu gegeben hatte: Gangster-Boss Bill. Ihr Weg führt die Braut bis ins ferne Okinawa, wo sie sich vom legendären Waffenschmied Hattori Hanzo ein Schwert anfertigen lässt, das fortan zu ihrem wichtigsten Begleiter wird …"
      },
      {
        "id": 393,
        "title": "Kill Bill - Volume 2",
        "originalTitle": "Kill Bill: Vol. 2",
        "releaseYear": "2004",
        "posterPath": "/qUkZvuQT6mF6UAc8x9bGRn8WC4M.jpg",
        "backdropPath": "/pgG6tzJzC8mjGqhaT8IWwEk00xf.jpg",
        "voteAverage": 7.9,
        "overview": "Die blutdurstige Rache der Braut ist noch nicht gestillt: Drei Namen stehen noch auf der Liste der kalten Schönen, die am Tag ihrer Hochzeit ins Jenseits befördert werden sollte und jetzt Jagd auf die macht, die ihren Tod verlangten. Nach Vernita Green und O-Ren Ishii sind nun der heruntergekommene Budd und die durchtriebene Elle Driver an der Reihe, bevor die Braut in Mexiko schließlich ihrem einstigen Chef und Liebhaber Bill gegenübersteht – und ihrer totgeglaubten Tochter."
      },
      {
        "id": 16869,
        "title": "Inglourious Basterds",
        "originalTitle": "Inglourious Basterds",
        "releaseYear": "2009",
        "posterPath": "/7Nq9bqyloLwYLkrG7q0tHI6kO45.jpg",
        "backdropPath": "/hwNtEmmugU5Yd7hpfprNWI0DGIn.jpg",
        "voteAverage": 8.2,
        "overview": "Im von Deutschland besetzten Frankreich muss Shosanna ansehen wie ihre Familie durch Oberst Hans Landa brutal ermordet wird. Sie kann entkommen und flieht nach Paris. Gemeinsam mit seinen 8 Männern, einer Elitetruppe aus jüdisch-amerikanischen Soldaten, will Offizier Aldo Raine systematische Vergeltungsschläge gegen Nazis durchführen. Sie werden in Frankreich abgesetzt, um dort unterzutauchen. Von den Deutschen als ‚Die Bastarde' gefürchtet versuchen sie den Führer des III. Reichs zu töten."
      },
      {
        "id": 68718,
        "title": "Django Unchained",
        "originalTitle": "Django Unchained",
        "releaseYear": "2012",
        "posterPath": "/yK0qrQhi3BbOXvTNOBWHgpcbckZ.jpg",
        "backdropPath": "/2oZklIzUbvZXXzIFzv7Hi68d6xf.jpg",
        "voteAverage": 8.2,
        "overview": "Als das Sklavenpaar Django und seine Frau Broomhilda bei einer Auktion getrennt werden, hat Django nur noch ein Ziel vor Augen: seine Frau wiederzufinden. Die Gelegenheit ergibt sich für den in Fesseln Geschlagenen schneller als erwartet, als er vom früheren Zahnarzt und jetzigen Kopfgeldjäger Dr. Schultz befreit wird, damit er ihm bei der Identifikation steckbrieflich gesuchter Verbrecher behilflich sei. Zum Dank will Dr. Schultz ihn zum Kopfgeldjäger ausbilden und ihm helfen, seine Frau ausfindig zu machen. Schließlich führt Django und Dr. Schultz die Spur nach Candyland, wo Broomhilda in den Besitz des charismatischen und überaus gefährlichen Calvin Candie übergegangen ist. Sie erschleichen sich erfolgreich das Vertrauen von Candie. Doch der Haussklave Stephen durchschaut ihr Spiel…"
      },
      {
        "id": 273248,
        "title": "The Hateful 8",
        "originalTitle": "The Hateful Eight",
        "releaseYear": "2015",
        "posterPath": "/kicXJhMpeB5xFbBG4EHcfIyOnyK.jpg",
        "backdropPath": "/7g1zO5t0bd27Iqn5ZUDJmksOGPJ.jpg",
        "voteAverage": 7.8,
        "overview": "Irgendwo im verschneiten Wyoming, einige Jahre nach dem Bürgerkrieg: Eine Postkutsche kämpft sich auf dem Weg zum Städtchen Red Rock durch die Landschaft. An Bord sind der Kopfgeldjäger John Ruth, seine Gefangene Daisy Domergue und zwei erst auf dem Weg zugestiegene Passagiere: der Ex-Soldat und nun ebenfalls als Kopfgeldjäger tätige Marquis Warren sowie Chris Mannix, der angibt, der neue Sheriff von Red Rock zu sein. Aufgrund eines heftigen Schneesturms sind sie jedoch dazu gezwungen, in einer Hütte Zuflucht zu suchen. Dort verstecken sich bereits der Mexikaner Bob, der undurchsichtige Oswaldo Mobray, der Cowboy Joe Gage und der in die Jahre gekommene Südstaaten-General Sanford Smithers vor dem Wetter. Schnell nehmen die Spannungen in der Gruppe von misstrauischen Raubeinen zu, nachdem man sich anfangs noch bestens unterhalten hat. Und bald wird klar, dass längst nicht jeder von ihnen die Hütte lebend verlassen wird."
      },
      {
        "id": 466272,
        "title": "Once Upon a Time... in Hollywood",
        "originalTitle": "Once Upon a Time... in Hollywood",
        "releaseYear": "2019",
        "posterPath": "/5RnMRADLB7Goin16z6l4dPIBCJR.jpg",
        "backdropPath": "/kKTPv9LKKs5L3oO1y5FNObxAPWI.jpg",
        "voteAverage": 7.4,
        "overview": "Es war einmal in Hollywood im Jahre 1969: Rick Dalton hat schon bessere Tage gesehen. Einst war der Schauspieler ein gefeierter Fernsehstar. Doch diese Zeiten sind längst vorbei. Inzwischen hält er sich mehr schlecht als recht mit Gastauftritten als Bösewicht in anderen TV-Produktionen über Wasser. Denn den Sprung auf die große Kinoleinwand hat er nie geschafft. Dabei ist sein Stunt-Double und Freund Cliff Booth stets an seiner Seite. Am Tiefpunkt seiner Karriere angelangt, bekommt Rick allerdings einen prominenten Nachbarn. Der Regisseur Roman Polanski ist mit seiner Frau, der Schauspielerin Sharon Tate in das Haus nebenan eingezogen. Während Tate das Leben in Amerikas Traumfabrik in vollen Zügen genießt, droht ihr Glück ein jähes Ende zu nehmen. Denn die mörderische Gruppe um Charles Manson plant eine Gräueltat, wie sie die Welt noch nicht gesehen hat …"
      }
    ]
  },
  {
    "id": "denis-villeneuve",
    "name": "Denis Villeneuve Collection",
    "category": "director",
    "tagline": "Visuelle Perfektion und cineastische Wucht",
    "description": "Epische Sci-Fi-Visionen und beklemmende Thriller von Dune über Blade Runner 2049 bis Arrival.",
    "backdropPath": "/3RFmTz5h2UuFWEV4oH00XICBR9y.jpg",
    "posterPath": "/d7DS20nwYT6WzbN2IvTvXvKPWjT.jpg",
    "movies": [
      {
        "id": 146233,
        "title": "Prisoners",
        "originalTitle": "Prisoners",
        "releaseYear": "2013",
        "posterPath": "/d7DS20nwYT6WzbN2IvTvXvKPWjT.jpg",
        "backdropPath": "/3RFmTz5h2UuFWEV4oH00XICBR9y.jpg",
        "voteAverage": 8.1,
        "overview": "Keller Dover ist ein bibeltreuer Kriegsveteran. Der harte Kerl steht mit beiden Beinen fest im Leben. Dovers Welt gerät jedoch aus den Fugen, als seine sechsjährige Tochter Anna und deren Freundin Joy an Thanksgiving entführt werden. Es beginnt eine fieberhafte Suche, die von dem jungen und ambitionierten Detektiv Loki angeführt wird, dessen primäres Ziel es jedoch ist, endlich der Kleinstadt zu entfliehen und in eine Großstadt versetzt zu werden. Alle Spuren zu der Entführung verlaufen im Nichts. Auch den einzigen Verdächtigen, den geistig zurückgebliebenen Alex Jones, muss Loki aus Mangel an Beweisen wieder laufen lassen. Familienvater Dover fasst daraufhin einen folgenschweren Entschluss: Er will die Wahrheit auf eigene Faust herausfinden und begibt sich auf einen verhängnisvollen und gnadenlosen Weg der Selbstjustiz um die beiden kleinen Mädchen vielleicht doch noch zu finden."
      },
      {
        "id": 273481,
        "title": "Sicario",
        "originalTitle": "Sicario",
        "releaseYear": "2015",
        "posterPath": "/s9v9EMtparHlLEF43u4gZMielu8.jpg",
        "backdropPath": "/fKPgObonYgPgCdu88yjV7Hpn7Dp.jpg",
        "voteAverage": 7.4,
        "overview": "Eine FBI-Agentin beteiligt sich an einem Undercover-Einsatz gegen einen mexikanischen Drogenbaron. Doch gewisse Maßnahmen der Mission kollidieren mit ihren Moralvorstellungen."
      },
      {
        "id": 329865,
        "title": "Arrival",
        "originalTitle": "Arrival",
        "releaseYear": "2016",
        "posterPath": "/4gUgPIhPBoamMdbvqHyjMmb2K60.jpg",
        "backdropPath": "/8MUZz7oPXQftFTslZpRP3CVMOoq.jpg",
        "voteAverage": 7.6,
        "overview": "Zwölf Alien-Raumschiffe landen auf der Erde in unterschiedlichen Regionen. Die Menschen versuchen mit den Außerirdischen zu kommunizieren, aber niemand versteht die walartigen Laute, die von den Aliens abgesondert werden. Im Auftrag der US-Regierung stellt Colonel Weber darum ein Team um die Linguistin Louise Banks und den Physiker Ian Donnelly zusammen, das eine Kommunikation mit den fremden Wesen herstellen soll, um deren Absichten in Erfahrung zu bringen. In Montana, wo eines der Schiffe über dem Boden schwebt, machen sich die beiden an die Arbeit – er, der rationale Naturwissenschaftler mit klarer Ansicht zu den Dingen, sie mit ihrem Sprachverständnis und ihrer ansteckenden Entdeckungsfreude. Doch bald beginnt ein Rennen gegen die Zeit, bei dem es um nicht weniger als den Fortbestand der Menschheit geht …"
      },
      {
        "id": 335984,
        "title": "Blade Runner 2049",
        "originalTitle": "Blade Runner 2049",
        "releaseYear": "2017",
        "posterPath": "/cdaf9yNZ7T0eZcrGiOilrVrTYHB.jpg",
        "backdropPath": "/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg",
        "voteAverage": 7.6,
        "overview": "Im Jahr 2023 wird die Herstellung von Replikanten – künstlichen Menschen, die zum Einsatz in den Weltall-Kolonien gezüchtet werden – nach mehreren schwerwiegenden Vorfällen verboten. Als der brillante Industrielle Niander Wallace ein neues, verbessertes Modell, den „Nexus 9“, vorstellt, wird die Produktion 2036 jedoch wieder erlaubt. Um ältere und somit nicht zugelassene Replikanten-Modelle, die sich auf der Erde verstecken, aufzuspüren und zu eliminieren, ist weiterhin die sogenannte „Blade Runner“-Einheit des LAPD im Einsatz, zu der auch K gehört. Bei seiner Arbeit stößt K auf ein düsteres, gut gehütetes Geheimnis von enormer Sprengkraft, das ihn auf die Spur eines ehemaligen Blade Runners bringt: Rick Deckard, der vor 30 Jahren aus Los Angeles verschwand ..."
      },
      {
        "id": 438631,
        "title": "Dune",
        "originalTitle": "Dune",
        "releaseYear": "2021",
        "posterPath": "/34Hr4bEzF30jd6sEvI4HihEUEI8.jpg",
        "backdropPath": "/qVgZu5BTx6pu4owCvVOm4zjTfOi.jpg",
        "voteAverage": 7.8,
        "overview": "„Dune“ erzählt die packende Geschichte des brillanten jungen Helden Paul Atreides, dem das Schicksal eine Rolle vorherbestimmt hat, von der er niemals geträumt hätte. Um die Zukunft seiner Familie und seines gesamten Volkes zu sichern, muss Paul auf den gefährlichsten Planeten des Universums reisen. Nur auf dieser Welt existiert ein wertvoller Rohstoff, der es der Menschheit ermöglichen könnte, ihr vollständiges geistiges Potenzial auszuschöpfen. Doch finstere Mächte wollen die Kontrolle über die kostbare Substanz an sich reißen. Es entbrennt ein erbitterter Kampf, den nur diejenigen überleben werden, die ihre eigenen Ängste besiegen."
      },
      {
        "id": 693134,
        "title": "Dune: Part Two",
        "originalTitle": "Dune: Part Two",
        "releaseYear": "2024",
        "posterPath": "/zYLP7Uiqz6XqoiQLAu4XQ6DRUMz.jpg",
        "backdropPath": "/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
        "voteAverage": 8.1,
        "overview": "Paul Atreides begibt sich mithilfe von Chani und den Fremen auf einen Rachefeldzug gegen die Verschwörer, die seine Familie vernichtet haben. Der junge Paul steht vor der Wahl zwischen der Liebe seines Lebens und dem Schicksal des gesamten Universums. Mit allen Mitteln aber muss er versuchen, eine schreckliche Zukunft zu verhindern – eine Zukunft, die niemand außer ihm vorhersehen kann."
      }
    ]
  },
  {
    "id": "marvel-mcu",
    "name": "Marvel Cinematic Universe (MCU)",
    "category": "franchise",
    "tagline": "Das komplette Multiversum: Alle Filme & Serien von Phase 1 bis 5",
    "description": "Von Iron Man und den Avengers bis hin zu Loki, WandaVision und Deadpool & Wolverine. Verfolge deinen Fortschritt durch jede einzelne MCU-Phase!",
    "backdropPath": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    "posterPath": "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    "subGroupLabel": "MCU Phase",
    "movies": [
      {
        "id": 1726,
        "title": "Iron Man",
        "originalTitle": "Iron Man",
        "releaseYear": "2008",
        "posterPath": "/wyEqQ7dvnYPR0z8M8ZDW5VSvRwZ.jpg",
        "backdropPath": "/cKvDv2LpwVEqbdXWoQl4XgGN6le.jpg",
        "voteAverage": 7.7,
        "overview": "Der Großindustrielle und Erfinder Tony Stark weiß zu leben: Als Milliardär liegen ihm die Frauen zu Füßen, er feiert Partys im Privatjet und verspielt Riesensummen im Casino, während seine Rüstungsfirma unter Obadiah Stane Rekordumsätze erzielt. Bei einem Waffentestlauf in Afghanistan wird er jedoch Opfer eines Bombenanschlags. Stark überlebt schwer verletzt und wird von einer Gruppe Aufständischer unter Führung des Warlords Raza dazu gezwungen, eine Superwaffe zu entwickeln. Es gelingt ihm jedoch, heimlich eine eiserne Schutzrüstung zu bauen, die ihn dank neuster Technologie zu Superkräften befähigt. Nach einer spektakulären Flucht zurück in die USA muss sich der Iron Man allerdings einem ersten übermächtigen Gegner stellen.",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 1724,
        "title": "Der unglaubliche Hulk",
        "originalTitle": "The Incredible Hulk",
        "releaseYear": "2008",
        "posterPath": "/bwCgRJRq6WUjhXIvBZjSI1lglRv.jpg",
        "backdropPath": "/xfBnQ4mgf1jYZsscJGJjr6ce0Ar.jpg",
        "voteAverage": 6.3,
        "overview": "Nachdem er bei einem biochemischen Experiment so stark verstrahlt wurde, dass er sich, wann immer er gereizt oder wütend wird, in das grüne Monstrum Hulk verwandelt, lebt der Wissenschaftler Bruce Banner ein zurückgezogenes Leben im brasilianischen Exil. Dorthin hat es ihn auf der Flucht vor dem Militärgeneral Ross verschlagen, der alles unternimmt, um den ehemaligen Freund seiner Tochter Betty für seine Zwecke zu missbrauchen. Während sich für Banner die Uhr rückwärts dreht, er nach einem Gegenmittel für die Mutation forscht und seine Wut unter Kontrolle zu bringen versucht, unterläuft ihm ein Missgeschick: General Ross gelingt es, Banner ausfindig zu machen. Auf der Flucht vor dem Militär und dem ehrgeizigen Soldaten Blonsky sucht er Zuflucht bei Betty, die ihm dabei hilft, die unfreiwilligen Superkräfte zu kontrollieren. Blonsky hat sich Banners einstige Formel zueigen gemacht und ist zur Kampfbestie Abomination mutiert.",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 10138,
        "title": "Iron Man 2",
        "originalTitle": "Iron Man 2",
        "releaseYear": "2010",
        "posterPath": "/nAhGVbqwWXjUMAaZvlmPr6nJOfR.jpg",
        "backdropPath": "/7lmBufEG7P7Y1HClYK3gCxYrkgS.jpg",
        "voteAverage": 6.9,
        "overview": "Tony Stark ist Iron Man. Nach der Öffentlichmachung dieser Doppelidentität sonnt sich der selbstverliebte Egomane in seinem noch jungen Ruhm als eiserner Weltenretter. Die Eröffnung der eigenen Expo inszeniert er wie ein Popkonzert, den Begehrlichkeiten des US-Militärs hinsichtlich seines Kampfanzugs erteilt er bei einem Untersuchungsausschuss vor laufenden Kameras eine arrogant-zynische Absage. Erst als ihm der russische Physiker und Exsträfling Ivan Vanko bei einem Show Grand Prix in Monte Carlo die Grenzen seiner Erfindung aufzeigt, bekommt Starks ehernes Ego erste Kratzer. Dazu kommt eine von Starks lebenswichtigem Minireaktor ausgehende Paladium-Vergiftung, die, sofern er keine Ersatzquelle auftut, unweigerlich zu seinem Tod führt.",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 10195,
        "title": "Thor",
        "originalTitle": "Thor",
        "releaseYear": "2011",
        "posterPath": "/wtHxoL3zFjIrjZBCGlRTb8ao1IW.jpg",
        "backdropPath": "/cDJ61O1STtbWNBwefuqVrRe3d7l.jpg",
        "voteAverage": 6.8,
        "overview": "Der mächtige Thor ist ein überragender Krieger im Königreich Asgard, dessen Überheblichkeit und Arroganz seine größte Schwäche ist. Wegen seiner Gedankenlosigkeit wird ein lange vergessen geglaubter Krieg neu entfacht. Die Strafe folgt umgehend: Unter den Menschen soll Thor auf der Erde Demut lernen, was dem Krieger zunächst nicht leicht fällt. Doch dann ist er zur Stelle, als es die Menschheit mit einem übermächtigen Gegner zu tun bekommt, der Unterstützung aus Asgard zu erhalten scheint.",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 1771,
        "title": "Captain America: The First Avenger",
        "originalTitle": "Captain America: The First Avenger",
        "releaseYear": "2011",
        "posterPath": "/osELOHV9IVKCIflUpJ60cN7mgP8.jpg",
        "backdropPath": "/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg",
        "voteAverage": 7,
        "overview": "1942 – die USA ziehen in den Kampf gegen Hitler-Deutschland. Steve Rogers wird auf Grund seines Gesundheitszustands als ungeeignet eingestuft. Mit Hilfe des Project: Rebirth soll er trotzdem in den Kampf gegen Nazis ziehen. Der kränkliche Steve wird in eine Art Super-Soldaten namens Captain America transformiert. Hilfe bekommt der neue Superheld dabei von seinem Freund Bucky Barnes. Gemeinsam kämpfen sie gegen Red Skul, Hitlers Geheimwaffe im Krieg gegen den Rest der Welt.",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 24428,
        "title": "Marvel's The Avengers",
        "originalTitle": "The Avengers",
        "releaseYear": "2012",
        "posterPath": "/hGTqvK9WaI74szUDPMHXrrHfiH3.jpg",
        "backdropPath": "/gHLs7Fy3DzLmLsD4lmfqL55KGcl.jpg",
        "voteAverage": 8.1,
        "overview": "Nick Fury ist der Anführer der Organisation S.H.I.E.L.D., einer internationalen Friedensorganisation. Die Behörde ist ein Who's Who der Marvel Superhelden, mit Iron Man, Thor, Captain America, Hawkeye, dem Unglaublichen Hulk und Black Widow. Als die weltweite Sicherheit von Thors sinistrem Halbbruder Loki und seiner Schar bedroht wird, werden Nick Fury und sein Team all ihre Kräfte brauchen, um die Welt vor einer Katastrophe zu bewahren ...",
        "mediaType": "movie",
        "subGroup": "Phase 1"
      },
      {
        "id": 68721,
        "title": "Iron Man 3",
        "originalTitle": "Iron Man 3",
        "releaseYear": "2013",
        "posterPath": "/h0vJ6sTYWQmqenNqRa1IiW1t0Ys.jpg",
        "backdropPath": "/4TSqtluelcWByj8YZdqwzQVjI0O.jpg",
        "voteAverage": 6.9,
        "overview": "Die Dellen, die sich Iron Man im Kampf gegen seine Widersacher Justin Hammer und Ivan Vanko zugezogen hatte, sind kaum ausgebeult, da droht neue Gefahr. Ein streng geheimes Serum, welches Extremis genannt wird und auf Nanotechnologie basiert, ermöglicht es den mit dem Serum injizierten Menschen, ungeahnte Kräfte zu entwickeln, allerdings mit einer Tendenz zu ungezügelter Aggressivität. Aldrichs Kollegin Maya Hansen, baut auf die Hilfe von Visionär Tony Stark. Währendessen bedroht eine dunkle Macht in Gestalt von The Mandarin die Welt und möchte dem Wettrüsten ein Ende zu seinen Gunsten setzen. Dabei verübt er einen Anschlag auf die amerikanische Regierung und dessen Präsidenten, sowie auf die Air Force, bei der Tony Starks Freund Rhodey dient. Als ein Anschlag auf Tony Starks Eigenheim folgt, geraten er und Pepper Potts in große Gefahr…",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 76338,
        "title": "Thor - The Dark Kingdom",
        "originalTitle": "Thor: The Dark World",
        "releaseYear": "2013",
        "posterPath": "/7a3za75dP6UPviHXNKIxzZNEwyx.jpg",
        "backdropPath": "/5o88bbqcV5STn56jqOeovaaWbAE.jpg",
        "voteAverage": 6.5,
        "overview": "Thor und Loki kehren in ihre Heimat Asgard zurück, wo Göttervater Odin darüber entscheidet, wie mit dem adoptierten Prinzen verfahren werden soll. Währenddessen erhebt sich eine andere Macht in einem der 9 Realms. Der Dunkelelf Malekith schart eine Armee uralter Wesen und Monster um sich, mit denen er nicht nur Asgard, sondern den ganzen Kosmos bedroht.  Der Donnergott trifft auf seine Angebetete Jane, die von einem Dämon besessen ist, dessen Verbindung mit den Dunkelelfen sehr nahe liegt. Thor muss also nicht nur seine Menschenfreundin retten, sondern auch eine eigene Streitkraft zusammenstellen, mit der er Malekith besiegen kann. Dafür muss er in die düstersten Ecken Asgards vordringen, wobei ihm jedoch nur eine Person helfen kann: Loki.",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 100402,
        "title": "The Return of the First Avenger",
        "originalTitle": "Captain America: The Winter Soldier",
        "releaseYear": "2014",
        "posterPath": "/14vWmCoZHXajYmtqSsswWpSOdrd.jpg",
        "backdropPath": "/jJvrPQAHFKmz4pVano4UtWTsRgA.jpg",
        "voteAverage": 7.7,
        "overview": "Nach den Geschehnissen mit den Avengers in New York zieht sich Steve Rogers nach Washington zurück. Dort hat er nach wie vor Probleme, sich an das moderne Leben zu gewöhnen. Doch er wird wieder in den Einsatz berufen, als ein S.H.I.E.L.D.-Agent Ziel eines Angriffs wird. Dies ist nur der Beginn eines größeren Plans, der die ganze Welt in Gefahr bringen könnte. Steve kehrt als Captain America zurück und versucht mit Hilfe von Agentin Romanoff, auch bekannt als Black Widow, die Verschwörung aufzuklären. Die Beiden erhalten zusätzliche Unterstützung vom Falken. Die Mission birgt einige Gefahren und die beiden werden oftmals Ziel von Attentaten. Doch die größte Gefahr ist der Gegner selbst: der Winter Soldier.",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 118340,
        "title": "Guardians of the Galaxy",
        "originalTitle": "Guardians of the Galaxy",
        "releaseYear": "2014",
        "posterPath": "/9pbW0r2YIkyWCOieSAUPrmS9cDp.jpg",
        "backdropPath": "/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
        "voteAverage": 7.9,
        "overview": "Nachdem der Abenteurer Peter Quill eine geheimnisvolle Kugel gestohlen hat, wird er das Opfer einer unerbittlichen Kopfgeldjagd mit Ronan the Accuser. Die Ziele des mächtigen Bösewichts bedrohen die Sicherheit des Universums. Um dem hartnäckigen Ronan und seinen Schergen zu entgehen, ist Quill gezwungen, einen nicht gerade einfach einzuhaltenden Waffenstillstand mit einem Quartett von ungleichen Außenseitern einzugehen - dazu gehört der waffenliebende Waschbär Rocket, der Baummensch Groot, die tödliche und rätselhafte Gamora und der rachsüchtige Drax the Destroyer. Als Peter dann die wahre Macht der Kugel und dessen Bedrohung für den Kosmos bewusst wird, muss er sein Bestes geben, um die bunt zusammengewürfelten Rivalen für einen letzten, verzweifelten Widerstand zu vereinen und eine Helden-Truppe aus ihnen machen - denn das Schicksal der Galaxie steht auf dem Spiel.",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 99861,
        "title": "Avengers: Age of Ultron",
        "originalTitle": "Avengers: Age of Ultron",
        "releaseYear": "2015",
        "posterPath": "/woAP8YaiVIuo7YXTeqVQEhXBdfz.jpg",
        "backdropPath": "/kIBK5SKwgqIIuRKhhWrJn3XkbPq.jpg",
        "voteAverage": 7.3,
        "overview": "Milliardär, Lebemann und Genie Tony Stark aka Iron Man will ein inaktives Friedensprogramm in Gang bringen, doch dabei geht etwas schief. So taucht der niederträchtige Roboter-Bösewicht Ultron auf und verfolgt Pläne zur Ausrottung der Menschheit. Nun ist es an den Helden, sich wieder zu sammeln und das schreckliche Schicksal der Welt abzuwenden. Zusammen mit Iron Man treten Thor, Captain America, Hulk, Black Widow und Hawkeye dem fiesen Ultron entgegen und bekommen dabei Unterstützung von den ehemaligen S.H.I.E.L.D.-Agenten Nick Fury und Maria Hill. Außerdem kreuzen die geheimnisvollen und mit besonderen Fähigkeiten ausgestatteten Newcomer Wanda und Pietro Maximoff den Weg der Helden, wie auch ein alter Bekannter in neuer Gestalt: Vision. Die Rächer müssen ihre Kräfte vereinen, unsichere Allianzen schmieden und auf unerwartete Aktionen reagieren, um die Bewohner der Erde einmal mehr vor dem drohenden Untergang zu bewahren.",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 102899,
        "title": "Ant-Man",
        "originalTitle": "Ant-Man",
        "releaseYear": "2015",
        "posterPath": "/myC8VQDoWIFq2WAnu9AAyJVTQRH.jpg",
        "backdropPath": "/1K3JmSNUN8OpjYsCjc0Hy0SYxAb.jpg",
        "voteAverage": 7.1,
        "overview": "Als Hank Pym den smarten Superdieb Scott Lang für einen großen Coup anwirbt, setzt der Knastveteran seine Qualitäten erstmals für das Gute ein. Um zu verhindern, dass Pyms Technologie, mit der Belebtes und Unbelebtes auf Miniaturgröße geschrumpft werden kann, militärisch genutzt wird, soll Lang die Fortschritte von Pyms skrupellosem Kontrahenten Cross sabotieren und dessen Spezialanzug stehlen. Doch dafür muss Lang ein Superheldentraining absolvieren und lernen, ein Heer von Ameisen für seinen Raubüberfall zu kontrollieren.",
        "mediaType": "movie",
        "subGroup": "Phase 2"
      },
      {
        "id": 271110,
        "title": "The First Avenger: Civil War",
        "originalTitle": "Captain America: Civil War",
        "releaseYear": "2016",
        "posterPath": "/7iB1ow4vPLRJ9UOnIwvEFQwRHHr.jpg",
        "backdropPath": "/7FWlcZq3r6525LWOcvO9kNWurN1.jpg",
        "voteAverage": 7.5,
        "overview": "Als bei einem Einsatz der Avengers in Lagos zwar der Diebstahl eines biologischen Kampfstoffes verhindert wird, dabei aber mehrere Zivilisten sterben, beschließen die Vereinten Nationen ein neues Gesetz, das die Avengers unter ihre Aufsicht bringen soll. Während Tony Stark alias Iron Man für eine Kontrolle der Superhelden votiert, stimmt Steve Rogers alias Captain America für ihre Unabhängigkeit. Auch die Teammitglieder sind uneinig und verteilen sich auf die beiden Wortführer. Als ein Bombenattentat auf jene UN-Versammlung verübt wird und man als vermeintlichen Schuldigen Steves alten Freund Bucky Barnes, nun als Winter Soldier bekannt, ausmacht, verschärft sich die Lage. Nachdem Steve Anweisungen missachtet und versucht Bucky auf eigene Faust zu stellen, damit dieser bei seiner Verhaftung nicht getötet wird, kommt es zu immer offeneren Animositäten zwischen den Superhelden ...",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 284052,
        "title": "Doctor Strange",
        "originalTitle": "Doctor Strange",
        "releaseYear": "2016",
        "posterPath": "/mzPnP190YLV4KFL3ZgsP7AsPEd2.jpg",
        "backdropPath": "/kkoiH8ZWxJ9WSAjOadGtuHUQxbm.jpg",
        "voteAverage": 7.4,
        "overview": "Doctor Stephen Strange ist ein arroganter, aber auch unglaublich talentierter Neurochirurg. Nach einem schweren Autounfall kann er seiner Tätigkeit trotz mehrerer Operationen und Therapien nicht mehr nachgehen. In seiner Verzweiflung wendet er sich schließlich von der Schulmedizin ab und reist nach Tibet, wo er bei der Einsiedlerin The Ancient One und ihrer Glaubensgemeinschaft lernt, sein verletztes Ego hinten anzustellen und in die Geheimnisse einer verborgenen mystischen Welt voller alternativer Dimensionen eingeführt wird. So entwickelt sich Doctor Strange nach und nach zu einem der mächtigsten Magier der Welt. Doch schon bald muss er seine neu gewonnenen mystischen Kräfte nutzen, um die Welt vor einer Bedrohung aus einer anderen Dimension zu beschützen.",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 283995,
        "title": "Guardians of the Galaxy Vol. 2",
        "originalTitle": "Guardians of the Galaxy Vol. 2",
        "releaseYear": "2017",
        "posterPath": "/ckujEWphKR2NG3vLLhUaLzJEGny.jpg",
        "backdropPath": "/aJn9XeesqsrSLKcHfHP4u5985hn.jpg",
        "voteAverage": 7.6,
        "overview": "Gerade erst sind in Guardians of the Galaxy aus Feinden Freunde geworden und schon machen die fünf Verbündeten gemeinsam das All unsicher. Peter Quill, Gamora, Rocket Raccoon, Groot und Drax the Destroyer bereisen als Weltraum-Abenteurer diesmal nicht nur bereits bekannte Orte, sondern stoßen auch in neue Winkel der Galaxie vor.  Nachdem die vergangenen Erlebnisse ihnen einige Rätsel aufgegeben haben, machen sie sich nun daran, diese zu lösen. ‚Star-Lord‘ Peter Quill hat beispielsweise gerade entdeckt, dass er nicht rein menschlicher Herkunft ist, und – auch wenn er es noch nicht weiß – rückt ein Zusammentreffen mit seinem Vater nun in greifbare Nähe.",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 315635,
        "title": "Spider-Man: Homecoming",
        "originalTitle": "Spider-Man: Homecoming",
        "releaseYear": "2017",
        "posterPath": "/elU7H73qN3WEQmmfdn0CdH3q8H8.jpg",
        "backdropPath": "/lAsr1ytUq0ATWdCbcjf59pupPFy.jpg",
        "voteAverage": 7.3,
        "overview": "Nach seinem Aufeinandertreffen mit den Avengers ist Peter Parker alias Spider-Man wieder zurück in New York, wo er bei seiner Tante May wohnt. Seitdem er mit bzw. gegen die anderen Helden kämpfte, fragt er sich, ob er mit seinen herausragenden Fähigkeiten nicht mehr machen sollte, als nur die freundliche Spinne aus der Nachbarschaft zu sein, die den einen oder anderen Einbruch verhindert und Taschendiebe stoppt. Doch daneben muss der von seinem neuen Mentor Tony Stark geförderte Jugendliche auch noch den Alltag auf die Reihe bekommen, den Alltag als Teenager an einer Highschool, wo er sich in Liz verguckt hat. Blöd, dass ausgerechnet in dieser Situation ein Bösewicht für Unruhe sorgt, der technisch bestens ausgestattet ist und von Rachedurst getrieben: der Vogelmann Vulture.",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 284053,
        "title": "Thor: Tag der Entscheidung",
        "originalTitle": "Thor: Ragnarok",
        "releaseYear": "2017",
        "posterPath": "/8etFULS6CRN39vvXykQH1mUD1yB.jpg",
        "backdropPath": "/vLmHH8jAy8Jq8uBsLucd3592WGh.jpg",
        "voteAverage": 7.6,
        "overview": "Donnergott Thor wird auf der anderen Seite des Universums gefangengenommen. Ohne seinen nützlichen Hammer Mjölnir scheint eine Flucht nahezu ausgeschlossen. Dabei läuft ihm allmählich die Zeit davon. Denn die ebenso mächtige wie erbarmungslose Hela, die nach jahrtausendlanger Gefangenschaft aus ihrem Gefängnis freigekommen ist, macht sich daran, die Macht auf Thors Heimatwelt Asgard zu übernehmen. Um das zu verhindern, setzt Thor alles daran, nach Hause zurückzukehren. Zwischen ihm und seiner Freiheit stehen jedoch tödliche Gladiatorenkämpfe auf dem Planeten Sakaar, die Mülldeponie des Universums. Bei einem dieser Duelle trifft Thor auf den Ex-Avenger und seinen früheren Mitstreiter Hulk den beliebtesten und erfolgreichsten Kämpfer auf Sakaar…",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 284054,
        "title": "Black Panther",
        "originalTitle": "Black Panther",
        "releaseYear": "2018",
        "posterPath": "/l6y476RPWK35Y7zmiMPcih4uU7A.jpg",
        "backdropPath": "/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
        "voteAverage": 7.4,
        "overview": "Aufgrund von Bodenschätzen außerirdischen Ursprungs ist das afrikanische Königreich Wakanda unermesslich reich. Nur hier kommt das Vibrationen jeder Art und Stärke absorbierende Mineral Vibranium vor. Den Bewohnern von Wakanda ist sehr daran gelegen, vor den Augen Fremder verborgen zu bleiben.  Reichtum weckt Begehrlichkeiten, und es braucht einen starken Führer, ihn zu verteidigen: Den Black Panther! Die Verantwortung des Black Panther wird vom König Wakandas an den jeweiligen Nachfolger weitergegeben. Und so nimmt T’Challa die Bürde und die Würde des ihm vorbestimmten Schicksals von seinem Vater T’Chaka nach dessen tragischen Tod entgegen.",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 299536,
        "title": "Avengers: Infinity War",
        "originalTitle": "Avengers: Infinity War",
        "releaseYear": "2018",
        "posterPath": "/2hj7diAFcApL2YfWwjiYCuRI4WW.jpg",
        "backdropPath": "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "voteAverage": 8.2,
        "overview": "Der mächtige Titan Thanos  hat es sich zur Aufgabe gemacht das halbe Universum auszulöschen. Um diesen perfiden Plan Realität werden zu lassen, benötigt er allerdings zuerst alle sechs Infinity-Steine, die ihm in Verbindung mit einem speziell gefertigten Handschuh, gottgleiche Kräfte verleihen. Da sich unglücklicherweise auch auf der Erde zwei dieser Steine befinden, betraut er seine treu ergebene Black Order mit deren Beschaffung. Sowohl die Avengers, als auch die Guardians of the Galaxy und Thor erfahren jedoch von Thanos' Plänen und stellen sich dem Schurken entgegen. Doch mit einen derart mächtigen Gegner hatte es bisher keiner von ihnen zu tun...",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 363088,
        "title": "Ant-Man and the Wasp",
        "originalTitle": "Ant-Man and the Wasp",
        "releaseYear": "2018",
        "posterPath": "/41imUCjSKoBjPUrfeCqib8KAvHS.jpg",
        "backdropPath": "/iYdgEUE2W2aJkgqfSjf1x3gFfuV.jpg",
        "voteAverage": 6.9,
        "overview": "Scott Lang hadert  mit den Konsequenzen seiner Taten als Superheld und Vater. Auf Drängen von Hope van Dyne (alias Wasp) und Dr. Hank Pym schlüpft er erneut in die Rolle des Ant-Mans und taucht in die Quantenwelt ein, um eine sehr gefährliche Rettungsmission gegen die Zeit und jede Chance auf Erfolg durchzuführen.",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 299537,
        "title": "Captain Marvel",
        "originalTitle": "Captain Marvel",
        "releaseYear": "2019",
        "posterPath": "/A7wZNpzhgS6mnER16YWrmvOHPiZ.jpg",
        "backdropPath": "/qAzYK4YPSWDc7aa4R43LcwRIAyb.jpg",
        "voteAverage": 6.8,
        "overview": "Bei einem Einsatz wird die Kree-Soldatin Vers von den Skrull gefangengenommen. Als die Gestaltenwandler auf Anweisung ihres Kapitäns Talos versuchen, mit einer Maschine Informationen aus dem Gehirn ihrer Geisel herauszuziehen, kann Vers mit einer Fluchtkapsel entkommen, woraufhin sie anschließend in den USA der 1990er Jahre durch das Dach einer Videothek kracht. Während die S.H.I.E.L.D.-Agenten Nick Fury und Phil Coulson erst einmal alles daransetzen, die vermeintliche Außerirdische zu fangen, findet Vers schon bald heraus, dass sie offenbar schon einmal auf diesem Planeten war und unter dem Namen Carol Danvers als Kampfpilotin für das US-Militär gearbeitet hat …",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 299534,
        "title": "Avengers: Endgame",
        "originalTitle": "Avengers: Endgame",
        "releaseYear": "2019",
        "posterPath": "/ibO8Pj0aA1nwj3Q9FMpMcYZkdCA.jpg",
        "backdropPath": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "voteAverage": 8.2,
        "overview": "Thanos hat also tatsächlich Wort gehalten, seinen Plan in die Tat umgesetzt und die Hälfte allen Lebens im Universum ausgelöscht. Die Avengers? Machtlos. Iron Man und Nebula sitzen auf dem Planeten Titan fest, während auf der Erde absolutes Chaos herrscht. Doch dann finden Captain America und die anderen überlebenden Helden auf der Erde heraus, dass Nick Fury vor den verheerenden Ereignissen gerade noch ein Notsignal absetzen konnte, um Verstärkung auf den Plan zu rufen. Die Superhelden-Gemeinschaft bekommt mit Captain Marvel kurzerhand tatkräftige Unterstützung im Kampf gegen ihren vermeintlich übermächtigen Widersacher. Und dann ist da auch noch Ant-Man, der wie aus dem Nichts auftaucht und sich der Truppe erneut anschließt, um die ganze Sache womöglich doch noch zu einem guten Ende zu bringen …",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 429617,
        "title": "Spider-Man: Far From Home",
        "originalTitle": "Spider-Man: Far From Home",
        "releaseYear": "2019",
        "posterPath": "/mp2rchOm2nchJ3E3fPzTFzkuLd3.jpg",
        "backdropPath": "/wqBW5ltBJu0gs26yCc8shQQV82d.jpg",
        "voteAverage": 7.4,
        "overview": "Nach der epischen Schlacht gegen Thanos und den schicksalshaften Ereignissen um die Avengers ist Peter zurück an seiner alten Schule. Um vom Superheldendasein etwas auszuruhen, kommt ihm eine Klassenfahrt nach Europa gerade recht, auch um seiner heimlichen Liebe \"MJ\" endlich seine Gefühle gestehen zu können. Die erste Station ist Venedig in Italien. Nach einer entspannten Gondelfahrt mit der Reisegruppe bricht aber plötzlich das Chaos los: Ein riesiges Monster kommt aus dem Wasser und greift die Stadt an. Dem stellt sich ein bisher unbekannter Superheld namens Mysterio entgegen. Und als wäre das nicht genug, taucht dann noch Nick Fury auf, um Spider-Man für eine Mission zu rekrutieren...",
        "mediaType": "movie",
        "subGroup": "Phase 3"
      },
      {
        "id": 85271,
        "title": "WandaVision",
        "originalTitle": "WandaVision",
        "releaseYear": "2021",
        "posterPath": "/ijWWwINc8h71NQ8j1LTJMFSj5wr.jpg",
        "backdropPath": "/fSCb3lzRbHknuKD7apdH4RYJLkc.jpg",
        "voteAverage": 8.2,
        "overview": "Wanda Maximoff und Vision – zwei Wesen mit Superkräften, die ein idyllisches Vorstadtleben führen – vermuten, dass nicht alles so ist, wie es scheint.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 88396,
        "title": "The Falcon and the Winter Soldier",
        "originalTitle": "The Falcon and the Winter Soldier",
        "releaseYear": "2021",
        "posterPath": "/o39vrKrNJOQtrojB5hMYNPoi30M.jpg",
        "backdropPath": "/aTjbqMONy77fHJrIYu14g1F0d5h.jpg",
        "voteAverage": 7.6,
        "overview": "Sam Wilson aka Falcon und Bucky Barnes aka Winter Soldier waren beide auf unterschiedliche Weise Freunde von Steve Rogers, dem Captain America. Nachdem dieser seine Rolle als heldenhaftes Vorbild der amerikanischen Nation nicht mehr ausführen kann, liegt es an den beiden, sein Schild hochzuhalten – im wahrsten Sinn des Wortes. An Herausforderungen mangelt es für die ungleichen Verbündeten nicht: Der aus Sokovian stammende Helmut Zemo sinnt nach dem Tod seiner Familie im Kampf zwischen Avengers und Ultron in seiner Heimat weiterhin auf die Auslöschung aller Superhelden.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 84958,
        "title": "Loki",
        "originalTitle": "Loki",
        "releaseYear": "2021",
        "posterPath": "/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg",
        "backdropPath": "/q3jHCb4dMfYF6ojikKuHd6LscxC.jpg",
        "voteAverage": 8.2,
        "overview": "Der launische Schurke Loki nimmt seine Rolle als Gott des Schabernacks wieder auf.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 497698,
        "title": "Black Widow",
        "originalTitle": "Black Widow",
        "releaseYear": "2021",
        "posterPath": "/gkyoYo9d6g98xjScnZwh3nL2Yfp.jpg",
        "backdropPath": "/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg",
        "voteAverage": 7.1,
        "overview": "Nachdem sie das Sokovia-Abkommen abgelehnt und Steve Rogers zur Flucht verholfen hat, befindet sich Natasha Romanoff auf der Flucht. Von der Regierung gejagt, führt sie ihr Weg nach Russland, wo sie auf alte Verbündete und neue Feinde trifft.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 91363,
        "title": "What If...?",
        "originalTitle": "What If...?",
        "releaseYear": "2021",
        "posterPath": "/lztz5XBMG1x6Y5ubz7CxfPFsAcW.jpg",
        "backdropPath": "/jnzoh5qoxRLFRIQAxnl6D3RStPC.jpg",
        "voteAverage": 8,
        "overview": "„What If…?“ stellt das MCU auf den Kopf und lenkt die Handlung der Filme in eine ganz neue Richtung.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 566525,
        "title": "Shang-Chi and the Legend of the Ten Rings",
        "originalTitle": "Shang-Chi and the Legend of the Ten Rings",
        "releaseYear": "2021",
        "posterPath": "/AjXzHBNlmCXZnvpONbUhGtgiUiA.jpg",
        "backdropPath": "/r7K6Xt0RX4Mw0cAbZVw5cyb1Tux.jpg",
        "voteAverage": 7.5,
        "overview": "Shang-Chi wurde von der terroristischen Geheimorganisation der Ten Rings seit frühster Kindheit zum Killer ausgebildet. Trotz dieses intensiven Martial-Arts-Trainings hat der junge Mann aber versucht, sich ein normales Leben in San Francisco aufzubauen.  Doch als er gerade glaubt, sein früheres Leben vielleicht wirklich hinter sich gelassen zu haben, holt die Vergangenheit ihn wieder ein. Zusammen mit seiner alten Kindheitsfreundin Katy wird er von seinem kriminellen Vater Wenwu in eine Welt gezogen, in der niemand irgendjemanden mit Samthandschuhen anfasst. Nur die zehn Ringe des Mandarin können das Blatt im Kampf gegen das Böse vielleicht noch wenden.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 524434,
        "title": "Eternals",
        "originalTitle": "Eternals",
        "releaseYear": "2021",
        "posterPath": "/sVvtzCxk4wowhU1g4fS6AG2MWg5.jpg",
        "backdropPath": "/c6H7Z4u73ir3cIoCteuhJh7UCAR.jpg",
        "voteAverage": 6.7,
        "overview": "Die Eternals sind ein Team aus uralten Außerirdischen, die seit Tausenden von Jahren im Verborgenen auf der Erde gelebt haben. Als eine unerwartete Tragödie sie dazu zwingt, aus dem Schatten zu treten, sind sie gezwungen, sich gegen den ältesten Feind der Menschheit, die Deviants, zu vereinen.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 88329,
        "title": "Hawkeye",
        "originalTitle": "Hawkeye",
        "releaseYear": "2021",
        "posterPath": "/2kLosa4O7g5Gw5D3Lm4AamIgzOy.jpg",
        "backdropPath": "/uHESULlKh7VSc0MRcqfyIf9Alk4.jpg",
        "voteAverage": 7.8,
        "overview": "Der ehemalige Avenger Clint Barton hat eine scheinbar einfache Mission: zu Weihnachten zu seiner Familie zurückzukehren. Wird ihm das gelingen? Vielleicht mithilfe von Kate Bishop, einer 22-jährigen Bogenschützin, die davon träumt, eine Superheldin zu werden. Die beiden sind gezwungen, zusammenzuarbeiten, als jemand aus Bartons Vergangenheit weit mehr zu entgleisen droht als die weihnachtlich-festliche Stimmung.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 634649,
        "title": "Spider-Man: No Way Home",
        "originalTitle": "Spider-Man: No Way Home",
        "releaseYear": "2021",
        "posterPath": "/iNKf4D0AzOj9GLq8ZyG3WZaqibL.jpg",
        "backdropPath": "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
        "voteAverage": 7.9,
        "overview": "Peter Parker ist demaskiert und kann sein normales Leben nicht mehr von den hohen Einsätzen als Superheld trennen. Als er Doctor Strange um Hilfe bittet, wird die Lage noch gefährlicher und er muss entdecken, was es wirklich bedeutet, Spider-Man zu sein.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 92749,
        "title": "Moon Knight",
        "originalTitle": "Moon Knight",
        "releaseYear": "2022",
        "posterPath": "/m9fANhU0knW4wPmTekBCJFOmVve.jpg",
        "backdropPath": "/1uegR4uAxRxiMyX4nQnpzbXhrTw.jpg",
        "voteAverage": 7.6,
        "overview": "Als dem sanftmütigen Souvenirverkäufer Steven Grant auf einmal Filmrisse und Erinnerungen an ein anderes Leben zu schaffen machen, findet er heraus, dass er an einer dissoziativen Identitätsstörung leidet, und seinen Körper mit dem Söldner Marc Spector teilt. Dann tauchen dessen Feinde in Stevens / Marcs Leben auf und während die beiden ihre komplexen Identitäten miteinander ausverhandeln und steuern müssen, finden sie sich inmitten der mächtigen Götter Ägyptens wieder.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 453395,
        "title": "Doctor Strange in the Multiverse of Madness",
        "originalTitle": "Doctor Strange in the Multiverse of Madness",
        "releaseYear": "2022",
        "posterPath": "/nRDLWnkyMpG2OnI9ZsV11y7Dh28.jpg",
        "backdropPath": "/AdyJH8kDm8xT8IKTlgpEC15ny4u.jpg",
        "voteAverage": 7.2,
        "overview": "Eigentlich wollte Doctor Strange nur seiner Ex-Freundin Christine zur Hochzeit gratulieren. Zum Feiern ist jedoch keine Zeit: Ein riesiges Monster droht, die Stadt in Schutt und Asche zu legen. Ziel des Wesens ist die Teenagerin America Chavez, welche die außergewöhnliche Gabe besitzt, zwischen Paralleluniversen reisen zu können. Zusammen mit dem Obersten Zauberer Wong versucht Strange das Mädchen zu beschützen und dafür zu sorgen, dass ihre mächtige aber zugleich gefährliche Fähigkeit nicht in die falschen Hände gerät.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 92782,
        "title": "Ms. Marvel",
        "originalTitle": "Ms. Marvel",
        "releaseYear": "2022",
        "posterPath": "/iWiBmZwboHN8WJ9wPHECCFRbW4K.jpg",
        "backdropPath": "/mfcLUWASJghU8MTNK38eYktfE83.jpg",
        "voteAverage": 6.3,
        "overview": "Kamala Khan ist eine muslimisch-amerikanische Teenagerin, die in Jersey City aufwächst. Als begeisterte Gamerin und Verfasserin von Fan Fiction ist Kamala ein Superhelden-Fan mit einer blühenden Fantasie - vor allem, wenn es um Captain Marvel geht. Allerdings hat Kamala das Gefühl, in der Schule und manchmal auch zu Hause nicht so recht reinzupassen. Aber nur, bis sie Superkräfte bekommt wie die Helden, zu denen sie immer aufgesehen hat. Das Leben ist besser mit Superkräften, oder?",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 616037,
        "title": "Thor: Love and Thunder",
        "originalTitle": "Thor: Love and Thunder",
        "releaseYear": "2022",
        "posterPath": "/1YvsQrN6RWDjxfaI8YMpACLM3HI.jpg",
        "backdropPath": "/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg",
        "voteAverage": 6.3,
        "overview": "Nachdem sein Ruhestand von Gorr dem Götterschlächter, einem galaktischen Killer, der die Auslöschung der Götter anstrebt, unterbrochen wird, bittet Thor Odinson um die Hilfe von König Walküre, Korg und seiner Ex-Freundin Jane Foster, die nun als Mighty Thor den Mjolnir schwingt. Gemeinsam begeben sie sich auf ein erschütterndes kosmisches Abenteuer, um das Geheimnis der Rache des Götterschlächters zu lüften und ihn aufzuhalten, bevor es zu spät ist.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 92783,
        "title": "She-Hulk: Die Anwältin",
        "originalTitle": "She-Hulk: Attorney at Law",
        "releaseYear": "2022",
        "posterPath": "/fUFsfY8v3mKaNRc3vvNfaSqfzWd.jpg",
        "backdropPath": "/eljErfkQUcFUgQkI4I1soZcH8MW.jpg",
        "voteAverage": 6.1,
        "overview": "Die auf Supermenschenrecht spezialisierte Anwältin Jennifer Walters muss sich nicht nur mit den alltäglichen Schwierigkeiten als Single in den 30ern rumschlagen, sondern auch lernen, das Leben als 2-Meter großer Hulk zu meistern.",
        "mediaType": "tv",
        "subGroup": "Phase 4"
      },
      {
        "id": 1013860,
        "title": "R.I.P.D. 2: Rise of the Damned",
        "originalTitle": "R.I.P.D. 2: Rise of the Damned",
        "releaseYear": "2022",
        "posterPath": "/g4yJTzMtOBUTAR2Qnmj8TYIcFVq.jpg",
        "backdropPath": "/kmzppWh7ljL6K9fXW72bPN3gKwu.jpg",
        "voteAverage": 6.2,
        "overview": "Der Wilde Westen im Jahre 1876: Sheriff Roy Pulsipher (Jeffrey Donovan) wird bei einer Schießerei mit einer Gaunerbande getötet. Kaum hat er realisiert, dass er nicht mehr lebt, wird ihm im Jenseits auch schon ein neuer Job angeboten: als Cop im R.I.P.D., dem Rest in Peace Department. Verstorbene ehemalige Gesetzeshüter werden dort mit der Aufgabe betraut, die Lebenden vor Dämonen-Angriffen und ähnlichen Unannehmlichkeiten zu beschützen. Als Pulsipher zur Erde zurückgeschickt wird, will er allerdings erst einmal nur eines: seinen eigenen Tod rächen. Doch dann öffnet sich im Städtchen Red Creek ein Tor zur Hölle und der Gesetzeshüter aus dem Jenseits hat nun eine viel größere Aufgabe: Er muss die gesamte Menschheit retten.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 505642,
        "title": "Black Panther: Wakanda Forever",
        "originalTitle": "Black Panther: Wakanda Forever",
        "releaseYear": "2022",
        "posterPath": "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
        "backdropPath": "/83H0C66AcvkwpG2738VCTHMY9uv.jpg",
        "voteAverage": 7,
        "overview": "Der König ist tot! König T'Challa, der als Black Panther auch Mitglied der Avengers-Heldentruppe war, stirbt an einer unbekannten Krankheit und ganz Wakanda ist in Trauer. Die Weltgemeinschaft sieht ihre Chance gekommen, um das vermeintlich geschwächte Königreich endlich zu Zugeständnissen bei der Lieferung des mächtigen Minerals Vibranium zu bewegen - und scheut dabei auch vor bewaffneten Überfällen nicht zurück. Doch Königin Ramonda bleibt standhaft und weist die Staatsoberhäupter in ihre Schranken. Wakanda wird auch ohne König T'Challa und den Black Panther weiter existieren und nicht vor anderen Nationen buckeln. Zur selben Zeit haben die USA mithilfe der erst 19 Jahre alten MIT-Studentin Riri Williams ein Gerät zur Aufspürung von Vibranium entwickelt und werden auch auf dem Grund des Meeres fündig. Angeführt von König Namor, bereitet sich das unter dem Meer lebende Volk der Talokanil aus dem Königreich Talokan darauf vor, einen Krieg mit den Landbewohnern zu beginnen.",
        "mediaType": "movie",
        "subGroup": "Phase 4"
      },
      {
        "id": 640146,
        "title": "Ant-Man and the Wasp: Quantumania",
        "originalTitle": "Ant-Man and the Wasp: Quantumania",
        "releaseYear": "2023",
        "posterPath": "/j3C9sEaEmqFqoZmnzQMFzKbLuNQ.jpg",
        "backdropPath": "/m8JTwHFwX7I7JY5fPe4SjqejWag.jpg",
        "voteAverage": 6.2,
        "overview": "Als Scott Langs Tochter Cassie ein Gerät entwickelt, durch das eine Kommunikation mit der Quantenebene möglich werden soll, endet das Experiment in einer Katastrophe: Cassie, Scott und seine Mitstreiterin Hope van Dyne finden sich ungewollt in dem mystischen Reich wieder. Gemeinsam mit Hopes Eltern Hank Pym und Janet van Dyne arbeitet das Trio an einem Weg zurück, während sie die mysteriöse Welt des Quantenreichs, in der sie auf fremde Kreaturen und eine versteckte Zivilisation treffen, auf Entdeckungsreise lockt. Dabei erfahren sie auch, dass Janet, die 30 Jahre lang hier gefangen war, noch das ein oder andere Geheimnis aus ihrer Vergangenheit vor ihnen verbirgt: Denn ebenso gefangen in der Quantendimension ist der mysteriöse Kang, der die Fähigkeit besitzt, durch Zeit und Multiversum zu reisen, und Scotts Hilfe für eine wichtige Mission benötigt. Doch ist dem mächtigen Kang zu trauen?",
        "mediaType": "movie",
        "subGroup": "Phase 5"
      },
      {
        "id": 447365,
        "title": "Guardians of the Galaxy Vol. 3",
        "originalTitle": "Guardians of the Galaxy Vol. 3",
        "releaseYear": "2023",
        "posterPath": "/d1DEggMecolWV6ZUcrygiLAqxOJ.jpg",
        "backdropPath": "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
        "voteAverage": 7.9,
        "overview": "Peter Quill, der immer noch unter dem Verlust von Gamora leidet, muss sein Team um sich versammeln, um das Universum zu verteidigen und gleichzeitig einen der Seinen zu schützen. Eine Mission, die, wenn sie nicht erfolgreich abgeschlossen wird, möglicherweise zum Ende der Guardians, wie wir sie kennen, führen könnte.",
        "mediaType": "movie",
        "subGroup": "Phase 5"
      },
      {
        "id": 114479,
        "title": "The Acolyte",
        "originalTitle": "The Acolyte",
        "releaseYear": "2024",
        "posterPath": "/rGCjqFBO85I1RojOKQMo8uyRQGy.jpg",
        "backdropPath": "/kwronSXO1ogMqHHFvY2eBxfFLdn.jpg",
        "voteAverage": 5.3,
        "overview": "Hundert Jahre vor dem Aufstieg des Imperiums: Der Orden der Jedi und die Galaktische Republik gedeihen seit Jahrhunderten ohne Krieg. Zu dieser Zeit muss sich ein Jedi-Meister der Untersuchung einer erschütternden Verbrechensreihe widmen und sich einem gefährlichen Gegner aus der Vergangenheit stellen.",
        "mediaType": "tv",
        "subGroup": "Phase 5"
      },
      {
        "id": 609681,
        "title": "The Marvels",
        "originalTitle": "The Marvels",
        "releaseYear": "2023",
        "posterPath": "/dWIieoTI4GF1YYSqDMcU4InwVco.jpg",
        "backdropPath": "/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
        "voteAverage": 5.9,
        "overview": "Als die Pflicht sie zu einem anomalen Wurmloch ruft, das ein Kree-Revolutionär ausgelöst hat, werden die Kräfte von Carol Danvers (Captain Marvel), Kamala Khan (Ms. Marvel), ein Superfan Jersey Citys, und Carols Nichte, die S.A.B.E.R.-Astronautin Captain Monica Rambeau, vereint. Das ungleiche Trio muss als „The Marvels“ das Universum retten.",
        "mediaType": "movie",
        "subGroup": "Phase 5"
      },
      {
        "id": 138502,
        "title": "X-Men '97",
        "originalTitle": "X-Men '97",
        "releaseYear": "2024",
        "posterPath": "/2HKBc5UiFw8JrruHq8S1Y7TnlW0.jpg",
        "backdropPath": "/jIyEmnBrZtl6SEWyBoMO2hZnzMa.jpg",
        "voteAverage": 8.7,
        "overview": "\"X-Men '97\" ist eine Zeitreise in die legendären 1990er Jahre, in der die X-Men, eine Gruppe Mutanten, ihre erstaunlichen Kräfte zum Schutz einer Welt einsetzen, von der sie gehasst und gefürchtet werden. Ihnen steht eine nie dagewesene Herausforderung bevor, als sie sich einer unerwarteten und gefährlichen neuen Zukunft stellen müssen.",
        "mediaType": "tv",
        "subGroup": "Phase 5"
      },
      {
        "id": 533535,
        "title": "Deadpool & Wolverine",
        "originalTitle": "Deadpool & Wolverine",
        "releaseYear": "2024",
        "posterPath": "/chDpMyvXNDFMhg3yUknITnGUCUk.jpg",
        "backdropPath": "/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
        "voteAverage": 7.6,
        "overview": "Seit Jahren träumt Deadpool davon, ein Avenger zu werden – und nun bietet ihm der zwielichtige TVA-Agent Mr. Paradox an, in die heilige Zeitlinie zu wechseln, um dort Teil des MCU zu sein. Doch dafür muss der vorlaute Söldner ein großes Opfer bringen: Seine Welt wird ausgelöscht. Weil Deadpool dies nicht zulassen will, schickt Mr. Paradox ihn und eine von Deadpool rekrutierte, abgehalfterte Variante von Wolverine in die Leere – die große Müllhalde aller Universen. Dort hat die finstere Cassandra Nova ein Schreckens-Regime errichtet. Deadpool ist klar: Will er seine Welt, all seine Freunde und seine große Liebe Vanessa retten, muss er an ihr vorbei und auch Mr. Paradox aufhalten. Doch dazu muss er erst einmal den verbitterten Wolverine überzeugen, ihm zu helfen …",
        "mediaType": "movie",
        "subGroup": "Phase 5"
      },
      {
        "id": 138501,
        "title": "Agatha All Along",
        "originalTitle": "Agatha All Along",
        "releaseYear": "2024",
        "posterPath": "/mGsxKwXUjojitRv2E9qMTbxbBRd.jpg",
        "backdropPath": "/tYLXJW1sZQU09VWY1BhSVPKGIwc.jpg",
        "voteAverage": 7.4,
        "overview": "Agatha Harkness versammelt einen Hexenzirkel und begibt sich auf eine gefährliche Reise.",
        "mediaType": "tv",
        "subGroup": "Phase 5"
      }
    ]
  },
  {
    "id": "james-bond",
    "name": "James Bond 007 (Gesamtreihe)",
    "category": "franchise",
    "tagline": "Alle 26 Filme: Von Sean Connery bis Daniel Craig",
    "description": "Im Geheimdienst Ihrer Majestät: Die legendärste Spionagereihe der Kinogeschichte. Filtere nach deinem Lieblings-Bond-Darsteller!",
    "backdropPath": "/wkA622CCN2X0uwpgqYEOnUYEDf5.jpg",
    "posterPath": "/uvigE215SzXdsEFPN0XRFR9RPiA.jpg",
    "subGroupLabel": "Schauspieler",
    "movies": [
      {
        "id": 646,
        "title": "James Bond 007 jagt Dr. No",
        "originalTitle": "Dr. No",
        "releaseYear": "1962",
        "posterPath": "/1NN9uwOnZiw4rj3drWHo0JVGZuq.jpg",
        "backdropPath": "/srgq7bzZsuDw7NoGXdazRXp7Hl6.jpg",
        "voteAverage": 7,
        "overview": "Der mysteriöse Wissenschaftler Dr. No sabotiert von seiner geheimen Basis auf Jamaica aus das amerikanische Raumfahrtprogramm. Der Secret Service setzt seinen besten Agenten auf den Wissenschaftler an.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 657,
        "title": "James Bond 007 - Liebesgrüße aus Moskau",
        "originalTitle": "From Russia with Love",
        "releaseYear": "1963",
        "posterPath": "/vmrQOory7HiGII0cZqZLMGpbsUD.jpg",
        "backdropPath": "/8JMiQa0OqsCYvbNUrQIrMzwV7g2.jpg",
        "voteAverage": 7.1,
        "overview": "James Bond soll in Istanbul eine russische Dechiffriermaschine von einer übergelaufenen Agentin erhalten. Das verlockende Angebot entpuppt sich jedoch als tödliche Falle.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 658,
        "title": "James Bond 007 - Goldfinger",
        "originalTitle": "Goldfinger",
        "releaseYear": "1964",
        "posterPath": "/okCBHoGLpyvZq8WRUZo9cKtox2I.jpg",
        "backdropPath": "/mM4WeXqJd2tu1gCF5GYyAZf2Npl.jpg",
        "voteAverage": 7.4,
        "overview": "Die teuerste Art zu töten. James Bond, der Superagent seiner Majestät, wird auf die Fährte eines verbrecherischen Genies gesetzt, das die Goldreserven von Fort Knox in seinen Besitz bringen will. Bonds Gegner Goldfinger ist der Mann, der seine abtrünnig gewordene Geliebte einem tödlichen Veredelungsprozeß aussetzte, indem er sie mit Gold überzog. Männliche Rivalen barbiert Odd-Job, der Leibwächter des exzentrischen Mulitmillionärs, mit seiner rasiermesserscharfen Hutkrempe aus Metall. Mit Hilfe von Pussy Galore will Bond den Raub des Goldes vereiteln...",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 660,
        "title": "James Bond 007 - Feuerball",
        "originalTitle": "Thunderball",
        "releaseYear": "1965",
        "posterPath": "/re3zKpNdDDRnaT1YkqMBo8N5tlF.jpg",
        "backdropPath": "/7DLCXCQx52YLle1qTokrjROTwVV.jpg",
        "voteAverage": 6.7,
        "overview": "Die Verbrecherorganisation Phantom bringt zwei Atombomben in ihre Gewalt und verlangt nun innerhalb von sieben Tagen 100 Millionen Pfund in Form lupenreiner Diamanten als Lösegeld. Der Secret Service schickt James Bond auf die Bahamas, um wieder einmal die Welt zu retten.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 667,
        "title": "James Bond 007 - Man lebt nur zweimal",
        "originalTitle": "You Only Live Twice",
        "releaseYear": "1967",
        "posterPath": "/ytGRF5H5A5VNBUZqUv6rsVPqqpm.jpg",
        "backdropPath": "/cpZAXIYA0lkZMpAt7d1MmH8ojNV.jpg",
        "voteAverage": 6.6,
        "overview": "Ein mysteriöses Raumschiff entführt eine russische und eine amerikanische Raumkapsel und bringt die Welt an den Rand eines Weltkrieges. James Bond ermittelt in Japan, trifft auf seinen Erzfeind Blofeld und die raffinierte Helga Brandt.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 668,
        "title": "James Bond 007 - Im Geheimdienst Ihrer Majestät",
        "originalTitle": "On Her Majesty's Secret Service",
        "releaseYear": "1969",
        "posterPath": "/6DBLzErXDrPSqUEXSUDk0IQslLv.jpg",
        "backdropPath": "/58pMrmwwcKamJIdjUlinE6QX1Fs.jpg",
        "voteAverage": 6.6,
        "overview": "Im Urlaub kann James Bond die junge Tracy Draco gerade noch davon abbringen, sich umzubringen. Ihr Vater, ein mächtiger Gangsterboss macht daraufhin 007 ein Angebot. Er erhält wichtige Informationen über seinen Erzfeind Blofeld, sollte er Tracy heiraten.",
        "mediaType": "movie",
        "subGroup": "George Lazenby"
      },
      {
        "id": 681,
        "title": "James Bond 007 - Diamantenfieber",
        "originalTitle": "Diamonds Are Forever",
        "releaseYear": "1971",
        "posterPath": "/2HJYuNpFZG5YGaZGNV4vAJM8mop.jpg",
        "backdropPath": "/pyTDtQCn5sG8gi2zkM5ZylSNmtJ.jpg",
        "voteAverage": 6.4,
        "overview": "Große Mengen Diamanten verschwinden, ohne auf dem internationalen Markt wieder aufzutauchen. James Bond wird in einen Schmugglerring infiltriert, um der Sache nachzugehen. Die Spur führt nach Las Vegas und zu keinem Geringeren als Bonds Erzfeind Ernst Stavro Blofeld.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 253,
        "title": "James Bond 007 - Leben und sterben lassen",
        "originalTitle": "Live and Let Die",
        "releaseYear": "1973",
        "posterPath": "/suFU9xpyZYtJaTjUyOHbgELuqj7.jpg",
        "backdropPath": "/hzmmXx6UeYQeylioNbliFKjSbV7.jpg",
        "voteAverage": 6.5,
        "overview": "An drei verschiedenen Orten der Erde werden gleichzeitig drei Agenten des britischen Geheimdienstes umgebracht. James Bond wird mit dem brisanten Fall beauftragt, der ihn nach New York führt. Dort stößt er auf den mysteriösen Unterweltboss Mr. Big, der ihn bereits als nächstes Ziel auserkoren hat. Bond kann jedoch entkommen und findet bald eine Verbindung zwischen Mr. Big und dem Diplomaten Katanga. Doch seine Spur führt noch viel weiter in die Unterwelt New Yorks.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 682,
        "title": "James Bond 007 - Der Mann mit dem goldenen Colt",
        "originalTitle": "The Man with the Golden Gun",
        "releaseYear": "1974",
        "posterPath": "/pBS0mJTBAFmdzn0UNV4uNe9M4u5.jpg",
        "backdropPath": "/3tpNEbRahT8smy7RraaWa0xg9Gv.jpg",
        "voteAverage": 6.5,
        "overview": "Eine goldene Pistolenkugel, auf der 007 eingraviert ist, trifft im Hauptquartier des Secret Service ein. Absender ist der Profikiller Scaramanga, und Scaramanga hat noch nie ein Ziel verfehlt. James Bond versucht den Killer rechtzeitig zu stoppen.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 691,
        "title": "James Bond 007 - Der Spion, der mich liebte",
        "originalTitle": "The Spy Who Loved Me",
        "releaseYear": "1977",
        "posterPath": "/3z50Zw7ryke1e8BZOoCqTmlfsLt.jpg",
        "backdropPath": "/lhPq8R8qgoyLNWvVTiqZSkYGLPX.jpg",
        "voteAverage": 6.8,
        "overview": "Ein russisches und ein amerikanisches U-Boot mit Atomraketen an Bord verschwinden spurlos von der Bildfläche. Amerikaner und Russen beschuldigen sich gegenseitig. James Bond soll das Rätsel der verschwundenen U-Boote lösen. Aber auch der KGB hat schon einen Agenten losgeschickt.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 698,
        "title": "James Bond 007 - Moonraker - Streng geheim",
        "originalTitle": "Moonraker",
        "releaseYear": "1979",
        "posterPath": "/6eLKYWcFWhtCTdaI2ErY60Z5uui.jpg",
        "backdropPath": "/mrDC5DLx2wljt4HZGwgkmqlzfcF.jpg",
        "voteAverage": 6.2,
        "overview": "Während des Transportes auf dem Rücken einer Boeing 747 wird ein Space Shuttle entführt und das Flugzeug vernichtet. Seine Nachforschungen führen James Bond zu der Herstellerfirma des Shuttles. Schon bald merkt er, dass deren Besitzer Hugo Drax die gesamte Menschheit vernichten will. Es kommt zum Showdown im Weltall.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 699,
        "title": "James Bond 007 - In tödlicher Mission",
        "originalTitle": "For Your Eyes Only",
        "releaseYear": "1981",
        "posterPath": "/d1oag1lJECK8GYellrjyDeOHyHh.jpg",
        "backdropPath": "/z7Jp7HAsY7MqXzPYzTjJnmOQk2r.jpg",
        "voteAverage": 6.5,
        "overview": "Ein als Fischkutter getarntes Spionageschiff der Engländer sinkt im ionischen Meer. An Bord befindet sich ein strenggeheimes Steuer- und Verschlüsselungsgerät ATAC. In feindlichen Händen könnte es zum Abschuss von Atomraketen auf westliche Städte verwendet werden. James Bond muss das Gerät finden, bevor es dem Feind in die Hände gerät.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 700,
        "title": "James Bond 007 - Octopussy",
        "originalTitle": "Octopussy",
        "releaseYear": "1983",
        "posterPath": "/ezfTabPy2lhS2qZA6pByq4Hz8To.jpg",
        "backdropPath": "/xTS1qCmhzH3vq7cuextO5vQA6eW.jpg",
        "voteAverage": 6.4,
        "overview": "Um die wahren Hintergründe einer gigantischen Juwelenschieberei aufzuspüren, ist James Bond der geheimnisvollen Octopussy auf den Fersen. Sie ahnt nicht, dass sie von einem Wahnsinnigen hinters Licht geführt wird. Der russische General Orlov benutzt ihren Octopussy-Zirkus vorgeblich, mit ihm den geraubten Kreml-Schatz durch Europa zu schmuggeln. Tatsächlich dient er ihm nur als trojanisches Pferd für einen atomaren Sprengkörper, der auf dem Gelände der US-Airforce in Feldberg detonieren soll.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 36670,
        "title": "Sag niemals nie",
        "originalTitle": "Never Say Never Again",
        "releaseYear": "1983",
        "posterPath": "/im3FnMct3LKIqzYdQqKMR3tkKKX.jpg",
        "backdropPath": "/45uCcAUB8Ljz3uKb1y1JHtT5aCT.jpg",
        "voteAverage": 6.1,
        "overview": "Von einem Nato-Stützpunkt in England werden auf spektakuläre Weise zwei Atomraketen gestohlen. Als die Nato damit erpresst werden soll, schicken die Briten ihren Topagenten James Bond, um die nukleare Bedrohung abzuwenden, und die Gangster dingfest zu machen.",
        "mediaType": "movie",
        "subGroup": "Sean Connery"
      },
      {
        "id": 707,
        "title": "James Bond 007 - Im Angesicht des Todes",
        "originalTitle": "A View to a Kill",
        "releaseYear": "1985",
        "posterPath": "/1q95oXKELFwEpqkPkNdKpY40BKN.jpg",
        "backdropPath": "/hvGWyyC8wER1I8ExSXNtFBs7Mgd.jpg",
        "voteAverage": 6.3,
        "overview": "Ein im Westen entwickelter Mikrochip, der unempfindlich gegen elektromagnetische Strahlung durch Nuklearexplosionen ist, fällt dem KGB in die Hände. James Bond soll die undichte Stelle finden. Schnell fällt sein Verdacht auf den Großindustriellen Max Zorin.",
        "mediaType": "movie",
        "subGroup": "Roger Moore"
      },
      {
        "id": 708,
        "title": "James Bond 007 - Der Hauch des Todes",
        "originalTitle": "The Living Daylights",
        "releaseYear": "1987",
        "posterPath": "/10Od1LGlmBbz4EVjPTyTtDV8zuU.jpg",
        "backdropPath": "/ebaq0ecL1Tu39rIExfHwE4ToFl2.jpg",
        "voteAverage": 6.6,
        "overview": "James Bond verhilft einem russischen General zur Flucht in den Westen. Von ihm erfährt er, dass der KGB in einer groß angelegten Aktion alle feindlichen Agenten töten will. Wenig später wird der General vor den Augen des Secret Service entführt. 007 schöpft einen Verdacht.",
        "mediaType": "movie",
        "subGroup": "Timothy Dalton"
      },
      {
        "id": 709,
        "title": "James Bond 007 - Lizenz zum Töten",
        "originalTitle": "Licence to Kill",
        "releaseYear": "1989",
        "posterPath": "/rTGkZ0E69mmBCKVZpNSONlRBA6I.jpg",
        "backdropPath": "/p6VFbg5lhWj0RCgXf5dj6IDMPvt.jpg",
        "voteAverage": 6.4,
        "overview": "James Bond und sein amerikanischer Kollege Felix Leiter verhaften den Drogenbaron Sanchez. Als diesem die Flucht gelingt, rächt er sich auf furchtbare Weise an Leiter und seiner Frau. Bond kennt nur noch ein Ziel: Rache.",
        "mediaType": "movie",
        "subGroup": "Timothy Dalton"
      },
      {
        "id": 710,
        "title": "James Bond 007 - GoldenEye",
        "originalTitle": "GoldenEye",
        "releaseYear": "1995",
        "posterPath": "/dlim5SqnaPVuTAinwc4mhLLRyxR.jpg",
        "backdropPath": "/fIWsCpYR9iGDMSbMTSAzy8L7Kg5.jpg",
        "voteAverage": 6.9,
        "overview": "Die russische Mafia-Gruppe Janus hat “Goldeneye”, zwei Satelliten, deren elektromagnetische Strahlen alle elektrischen Geräte im Umkreis eines anvisierten Ziels zerstören, in ihre Kontrolle gebracht. Der Chef dieser kriminellen Bande ist Ex-”006″ Alec Trevelyan, James Bonds ehemaliger Kollege. Zusammen mit der Computerspezialistin Natalya Simonova setzt sich 007 auf die Spuren des Verräters.",
        "mediaType": "movie",
        "subGroup": "Pierce Brosnan"
      },
      {
        "id": 714,
        "title": "James Bond 007 - Der Morgen stirbt nie",
        "originalTitle": "Tomorrow Never Dies",
        "releaseYear": "1997",
        "posterPath": "/tDfR8AXJO1MglZm1o1BewO22Y7u.jpg",
        "backdropPath": "/fesAgiKA0pc04vScDTAQe1f9nd4.jpg",
        "voteAverage": 6.4,
        "overview": "Der britische Medienmogul Carver will durch Manipulation und Intrigen England in einen Krieg mit China stürzen, denn schlechte Nachrichten bringen Geld. Nur James Bond kann ihn davon abhalten, durch seine Medienpräsenz einer der mächtigsten Männer der Welt zu werden.",
        "mediaType": "movie",
        "subGroup": "Pierce Brosnan"
      },
      {
        "id": 36643,
        "title": "James Bond 007 - Die Welt ist nicht genug",
        "originalTitle": "The World Is Not Enough",
        "releaseYear": "1999",
        "posterPath": "/fdWolbQxwloXsoAlTpn9NlbwrO3.jpg",
        "backdropPath": "/n2jVDMcBEWsLFooO7W1ZkcMUtWS.jpg",
        "voteAverage": 6.3,
        "overview": "Im Hauptquartier des britischen Geheimdienstes kommt Öl-Multi Sir Robert King bei einem Bombenanschlag ums Leben. Agent 007 soll den Mörder entlarven und gleichzeitig Elektra, die bildhübsche Erbin des Milliarden-Imperiums, vor berüchtigten internationalen Terroristen beschützen.",
        "mediaType": "movie",
        "subGroup": "Pierce Brosnan"
      },
      {
        "id": 36669,
        "title": "James Bond 007 - Stirb an einem anderen Tag",
        "originalTitle": "Die Another Day",
        "releaseYear": "2002",
        "posterPath": "/tAWx4Ju69rzDTMkntblMRhuCy.jpg",
        "backdropPath": "/orI5mvpksYIlhJqzdmeipys6sHQ.jpg",
        "voteAverage": 6,
        "overview": "Auf der Jagd nach dem größenwahnsinnigen Schurken Gustav Graves und seinem gnadenlosen Erfüllungsgehilfen Zao reist Bond in die Höhle des Löwen bis nach Island. In einem fantastischen, vollkommen aus Eis erbauten Palast muss er am eigenen Leib die durchschlagende Wirkung einer neuen Superwaffe kennen lernen. Das Geschehen spitzt sich zu, bis es schließlich, wieder am Ausgangsort Korea angelangt, zu einem explosiven Showdown – und einem unvergesslichen Schlussakt – kommt.",
        "mediaType": "movie",
        "subGroup": "Pierce Brosnan"
      },
      {
        "id": 36557,
        "title": "James Bond 007 - Casino Royale",
        "originalTitle": "Casino Royale",
        "releaseYear": "2006",
        "posterPath": "/uvigE215SzXdsEFPN0XRFR9RPiA.jpg",
        "backdropPath": "/klJMCIblHLFwCuGjKz7tyOpekIC.jpg",
        "voteAverage": 7.6,
        "overview": "Sein erster Auftrag, nachdem er die Lizenz zum Töten erhalten hat, führt den MI6-Agenten James Bond nach Madagaskar, wo er auf den Terroristen Mollaka angesetzt wird. Zwar verläuft nicht alles nach Plan, doch als Bond auf eigene Faust weiter ermittelt, kommt er auf die Spur von Le Chiffre, dem Bankier einer weltweit operierenden Terror-Organisation. Dieser plant, das Vermögen seiner Organisation durch ein illegales Pokerspiel im „Casino Royale“ in Montenegro um ein Vielfaches zu erhöhen, wofür natürlich auch ein hoher Einsatz nötig ist. Der MI6 sieht daher die Chance, die Terroristen in den finanziellen Ruin zu treiben und beauftragt James Bond, die Pläne von Le Chiffre zunichte zu machen.",
        "mediaType": "movie",
        "subGroup": "Daniel Craig"
      },
      {
        "id": 10764,
        "title": "James Bond 007 - Ein Quantum Trost",
        "originalTitle": "Quantum of Solace",
        "releaseYear": "2008",
        "posterPath": "/5aFAFIQrB4uHfuEByUknFGRvLOE.jpg",
        "backdropPath": "/uGs5Z7dMguf7kxWubGFcp9EhKcy.jpg",
        "voteAverage": 6.3,
        "overview": "Nach dem Tod von Vesper Lynd versucht James Bond an die Hintermänner des Komplotts gegen Lynd zu kommen. Beim MI6 wird dazu Mr. White verhört, dem durch einen internen Verrat während des Verhörs die Flucht gelingt. Die Spur führt Bond nach Haiti. Dort gelangt er durch die attraktive Camille an den zwielichtigen Dominic Greene, der mit dem Komplott in Verbindung zu stehen scheint. Bond muss fortan nicht nur einmal um sein Leben bangen...",
        "mediaType": "movie",
        "subGroup": "Daniel Craig"
      },
      {
        "id": 37724,
        "title": "James Bond 007 - Skyfall",
        "originalTitle": "Skyfall",
        "releaseYear": "2012",
        "posterPath": "/AkpcDSA2NQb0tlNyOs2h00qX0K0.jpg",
        "backdropPath": "/wkA622CCN2X0uwpgqYEOnUYEDf5.jpg",
        "voteAverage": 7.3,
        "overview": "Auf der Jagd nach einer Liste von Undercoveragenten, die mit diesem Dokument enttarnt und in den sicheren Tod geschickt werden könnten, stürzt James Bond, von einer Kugel getroffen, in eine tiefe Schlucht. Von Freund und Feind für tot gehalten, hält sich 007 versteckt, bis ihn ein Bombenanschlag auf seinen Geheimdienst zum Handeln zwingt. So kehrt Bond zum MI6 zurück, kämpft gegen einen unbekannten Gegner, der nur ein Ziel kennt: Dem britischen Geheimdienst empfindlich zu schaden und dessen Chefin M zu töten.",
        "mediaType": "movie",
        "subGroup": "Daniel Craig"
      },
      {
        "id": 206647,
        "title": "James Bond 007 - Spectre",
        "originalTitle": "Spectre",
        "releaseYear": "2015",
        "posterPath": "/zmSO6LBHJdVAnlgRHlBmIyVfm6L.jpg",
        "backdropPath": "/cCKU3EuiSKt6xsOI6gg5kiFgZYm.jpg",
        "voteAverage": 6.6,
        "overview": "James Bond erhält eine kryptische Nachricht aus seiner Vergangenheit, die ihn auf die Spur einer finsteren Organisation bringt. Bond muss immer mehr entdecken, dass es viele Täuschungen und Lügen gibt, die er entschlüsseln muss. Während sein Boss M mit anderen Problemen kämpft, mit politischen Kräften konfrontiert ist, die den ganzen Geheimdienst gefährden, erkennt Bond erst nach und nach die schreckliche Wahrheit hinter Spectre.",
        "mediaType": "movie",
        "subGroup": "Daniel Craig"
      },
      {
        "id": 370172,
        "title": "James Bond 007 - Keine Zeit zu sterben",
        "originalTitle": "No Time to Die",
        "releaseYear": "2021",
        "posterPath": "/bqq2dlwWAm5O5RVPGHVwwxhESK1.jpg",
        "backdropPath": "/x9td0NQha0t44K2qgcMipLOGjVi.jpg",
        "voteAverage": 7.3,
        "overview": "James Bond hat seine Lizenz zum Töten im Auftrag des britischen Geheimdienstes abgegeben und genießt seinen Ruhestand in Jamaika. Die friedliche Zeit nimmt ein unerwartetes Ende, als sein alter CIA-Kollege Felix Leiter auftaucht und ihn um Hilfe bittet. Ein bedeutender Wissenschaftler ist entführt worden und muss so schnell wie möglich gefunden werden. Was als simple Rettungsmission beginnt, erreicht bald einen bedrohlichen Wendepunkt, denn Bond kommt einem geheimnisvollen Gegenspieler auf die Spur, der im Besitz einer brandgefährlichen neuen Technologie ist.",
        "mediaType": "movie",
        "subGroup": "Daniel Craig"
      }
    ]
  },
  {
    "id": "the-dark-knight",
    "name": "The Dark Knight & Batman",
    "category": "franchise",
    "tagline": "Der dunkle Ritter von Gotham City",
    "description": "Die gefeierte Dark Knight Trilogie von Christopher Nolan und Matt Reeves düstere Neuinterpretation The Batman.",
    "backdropPath": "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
    "posterPath": "/b3UIToGx8JIpRqUTGkaoyaNLuU3.jpg",
    "movies": [
      {
        "id": 272,
        "title": "Batman Begins",
        "originalTitle": "Batman Begins",
        "releaseYear": "2005",
        "posterPath": "/b3UIToGx8JIpRqUTGkaoyaNLuU3.jpg",
        "backdropPath": "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
        "voteAverage": 7.7,
        "overview": "Wie wurde Bruce Wayne zu Batman? Als kleiner Junge musste Bruce Wayne mit ansehen, wie seine Eltern auf grauenhafte Weise umgebracht wurden. Deshalb kümmert sich der Butler Alfred Pennyworth um ihn und zieht ihn groß.Eines Tages macht er sich in aller Welt auf die Suche nach einem Weg, die Ungerechtigkeit zu bekämpfen. Als er nach seiner Reise wieder in seine Heimatstadt Gotham City zurückkehrt, muss er feststellen, dass die Verbrechensrate deutlich angestiegen ist. Dieser Umstand und der Drang nach Rache am Mord seiner Eltern treiben ihn langsam aber sicher dazu, sich Kampftechniken beizubringen und ein Fledermauskostüm zu entwerfen, mit deren Hilfe er Nacht für Nacht die Kriminellen der Stadt zur Strecke bringt - als Batman."
      },
      {
        "id": 155,
        "title": "The Dark Knight",
        "originalTitle": "The Dark Knight",
        "releaseYear": "2008",
        "posterPath": "/z1DfRQf2CgnROyhVZ6ch8FbWt71.jpg",
        "backdropPath": "/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        "voteAverage": 8.5,
        "overview": "Gemeinsam mit Bezirksstaatsanwalt Harvey Dent und Lieutenant James Gordon versucht der im Fledermauskostüm agierende Milliardär Bruce Wayne dem Verbrechen in Gotham City Einhalt zu gebieten. Wie aus dem Nichts taucht plötzlich ein psychotischer Superverbrecher auf - der Joker. In seiner wahnhaften Vision möchte er die Stadt in Chaos und Anarchie stürzen und Batman scheint der einzige, der ihn stoppen kann. Bis es zum endgültigen Show-Down kommt, wird aber viel Blut fließen und auch Menschen die Bruce Wayne nahe stehen, könnten Opfer werden."
      },
      {
        "id": 49026,
        "title": "The Dark Knight Rises",
        "originalTitle": "The Dark Knight Rises",
        "releaseYear": "2012",
        "posterPath": "/9NyCuhyvFKTqGRLcr4r8fWXnu9v.jpg",
        "backdropPath": "/c3OHQncTAnKFhdOTX7D3LTW6son.jpg",
        "voteAverage": 7.8,
        "overview": "Nach dem Tod des Staatsanwalts Harvey Dent alias Two-Face nahm Batman die Schuld von dessen Verbrechen auf sich, um seinen Ruf zu schützen. Daher wurde er von dem Gotham City Police Department gejagt und verließ die Stadt. Die Handlung des Films setzt acht Jahre nach den Ereignissen von The Dark Knight ein. Nachdem der bemerkbar gealterte Batman nach Gotham zurückkehrt, muss er die Wahrheit der geheimnisvollen Selina Kyle herausfinden und den Schurken Bane davon abhalten, Gotham zu zerstören"
      },
      {
        "id": 414906,
        "title": "The Batman",
        "originalTitle": "The Batman",
        "releaseYear": "2022",
        "posterPath": "/6zm78OqO4jWCpuaZ7q6Mb5j1beM.jpg",
        "backdropPath": "/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg",
        "voteAverage": 7.7,
        "overview": "Zwei Jahre lang jagte Bruce Wayne als Batman Verbrecher auf der Straße und geriet immer tiefer in die Schattenwelt Gothams. Im korrupten Netzwerk der Beamten und VIPs konnte er nur auf wenige Vertraute zählen, daher verkörperte er bald als Einziger die Rache der Bürger. Als ein Killer es mit einer Vielzahl an sadistischen Machenschaften auf die Elite Gothams abgesehen hat, führt eine Spur aus mysteriösen Hinweisen den weltbesten Detective in die Unterwelt, wo er auf Selina Kyle a.k.a. Catwoman, Oswald Cobblepot a.k.a. der Pinguin, Carmine Falcone und Edward Nashton a.k.a. der Riddler stößt. Mit der Zeit wird das wahre Ausmaß des verbrecherischen Plans klar und die Beweise deuten immer mehr auf einen Kriminellen im näheren Umfeld Batmans hin. Nun muss Batman neue Kontakte knüpfen, den Verbrecher entlarven und den Machtmissbrauch und die Korruption, die Gotham schon lange im Griff haben, gnadenlos niederschlagen."
      }
    ]
  },
  {
    "id": "hayao-miyazaki",
    "name": "Studio Ghibli & Hayao Miyazaki",
    "category": "director",
    "tagline": "Die magische Welt des japanischen Animationskinos",
    "description": "Poetische Kunstwerke voller Fantasie, Herz und Botschaft für die Natur und das Leben.",
    "backdropPath": "/z2jsAbXWGdJvadhovznjGg33VND.jpg",
    "posterPath": "/k6UkIyNh4IMnrAITvNRKXjO9X7X.jpg",
    "movies": [
      {
        "id": 81,
        "title": "SternenKrieger",
        "originalTitle": "風の谷のナウシカ",
        "releaseYear": "1984",
        "posterPath": "/k6UkIyNh4IMnrAITvNRKXjO9X7X.jpg",
        "backdropPath": "/z2jsAbXWGdJvadhovznjGg33VND.jpg",
        "voteAverage": 7.9,
        "overview": "Ein verheerender Krieg hat die Erde in ein wüstes Ödland verwandelt, auf dem sich ein Pilzwald ausbreitet, dessen Sporen für den Menschen hochgiftig sind. Eine der wenigen noch existierenden Zivilisationen lebt im Tal der Winde, dessen natürliche Aufwinde verhindern, dass giftige Pilzsporen dorthin gelangen. Nausicaä ist die Prinzessin dieses Volkes und sie besitzt die seltene Gabe, die Gefühle und Gedanken der Tiere zu verstehen sowie mit der fremdartigen Flora und Fauna zu kommunizieren. Als ein anderes Volk das Tal erobern will, ist Nausicaä die letzte Hoffnung: Im Bestreben, eine friedliche Koexistenz zu erreichen, kämpft Nausicaä verzweifelt mit allen ihr zur Verfügung stehenden Mitteln und wird so zur Botschafterin einer uralten Prophezeiung."
      },
      {
        "id": 10515,
        "title": "Das Schloss im Himmel",
        "originalTitle": "天空の城ラピュタ",
        "releaseYear": "1986",
        "posterPath": "/fJawYdTmoGXZyF9MzJpEtlAVb3s.jpg",
        "backdropPath": "/3cyjYtLWCBE1uvWINHFsFnE8LUK.jpg",
        "voteAverage": 8,
        "overview": "Unvorstellbarer Reichtum und eine geheimnisvolle Technologie, mit der sich die Welt beherrschen lässt. All dies soll man finden können auf Laputa, dem sagenumwobenen Schloss im Himmel. Sheeta, ein Mädchen, besitzt einen magischen Kristall, der ihr den Weg nach Laputa weist. Kein Wunder, dass ihr schon bald andere auf den Fersen sind: eine Bande von Himmelspiraten, die Armee sowie der Regierungsagent Musca. Glücklicherweise trifft Sheeta in dem Jungen Pazu nicht nur einen Begleiter, sondern findet durch das gemeinsame Abenteuer auch einen Freund."
      },
      {
        "id": 8392,
        "title": "Mein Nachbar Totoro",
        "originalTitle": "となりのトトロ",
        "releaseYear": "1988",
        "posterPath": "/bPBYikmzC8vP1Njdm6iUQv8eTKD.jpg",
        "backdropPath": "/zkThiZAaAie8Lw7RAc5yPTOewBV.jpg",
        "voteAverage": 8.1,
        "overview": "Die 8-jährige Satsuki und ihre kleine Schwester Mei ziehen mit ihrem Vater, einem Universitätsprofessor, auf das Land. Sie wollen in der Nähe ihrer Mutter sein, die sich in einem nahe gelegenen Krankenhaus von einer schweren Krankheit erholt. Ihr neues Zuhause ist ein altes Bauernhaus, das einige Zeit unbewohnt war. Beim Spielen auf dem Hof entdeckt die kleine Mei eines Tages ein winziges Wesen mit einem Sack, das Eicheln sammelt. Sie folgt ihm in den Wald und klettert durch das Gestrüpp. Plötzlich fällt sie in ein Loch im Stamm eines riesigen Baumes. Am Ende des Loches trifft sie auf den fest schlafenden Totoro, eine riesige fellige Kreatur, die fast so groß ist wie ein kleines Haus. Die Kinder freunden sich schnell mit dem magischen Wesen an und erleben gemeinsam mit ihm viele tolle Abenteuer."
      },
      {
        "id": 128,
        "title": "Prinzessin Mononoke",
        "originalTitle": "もののけ姫",
        "releaseYear": "1997",
        "posterPath": "/vFRKcH8zDqEx4nUnm0cs5lh5wwj.jpg",
        "backdropPath": "/gl0jzn4BupSbL2qMVeqrjKkF9Js.jpg",
        "voteAverage": 8.3,
        "overview": "Japan im frühen Mittelalter. Der junge Krieger Ashitaka tötet in Notwehr einen dämonischen Eber und wird darauf mit einem Fluch belegt. Auf der Suche nach Heilung durchstreift Ashitaka das Land und stößt schließlich nahe einer befestigten Hüttensiedlung, die sich tief in das einst idyllische Land um einen Heiligen Berg frisst, auf die von Wölfen großgezogene Kriegerin San, genannt Mononoke. Obwohl San einen Krieg für die Natur wider ihre Zerstörer führt, verliebt sie sich in Ashitaka."
      },
      {
        "id": 129,
        "title": "Chihiros Reise ins Zauberland",
        "originalTitle": "千と千尋の神隠し",
        "releaseYear": "2001",
        "posterPath": "/wWNLsGvKqhi6cNWul0uvhqbQ4kl.jpg",
        "backdropPath": "/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
        "voteAverage": 8.5,
        "overview": "Als die kleine Chihiro mit ihren Eltern während eines Ausflugs einen dunklen Tunnel durchquert, ahnt sie noch nicht, was sie auf der anderen Seite erwarten wird. Denn dort liegt eine für Menschen normalerweise unsichtbare Stadt der Geister. Zu allem Übel muss Chihiro dann auch noch feststellen, dass sich ihre Eltern in Schweine verwandelt haben und sie selbst plötzlich unsichtbar zu werden scheint..."
      },
      {
        "id": 4935,
        "title": "Das wandelnde Schloss",
        "originalTitle": "ハウルの動く城",
        "releaseYear": "2004",
        "posterPath": "/tXB5bdKfLI3XGrmJqaEh0kTKmH6.jpg",
        "backdropPath": "/nv5wwZou159v5OC61i4ElR7OqyY.jpg",
        "voteAverage": 8.4,
        "overview": "Die junge Hutmacherin Sophie lebt in einer Kleinstadt im Lande Ingary, einer Welt voller Magie und Fabelwesen, die aber auch schon erste Flugzeuge und Dampfmaschinen kennt. Eines Tages lernt Sophie durch Zufall den jungen Magier Hauro kennen und verliebt sich in ihn - doch eine eifersüchtige Hexe verwandelt sie in eine alte Frau. Sophie verlässt ihre Heimatstadt, um nach einem Mittel gegen den Fluch zu suchen, und gelangt schließlich zu Hauros wandelndem Schloss. Hier findet sie eine Anstellung als Putzfrau und gewinnt durch ihre freundliche und zuvorkommende Art schnell die Herzen der übrigen Bewohner. Nur Hauro bleibt ihr gegenüber kalt und abweisend. Als der König von Hauro verlangt, für ihn in den Krieg zu ziehen, begreift Sophie allmählich, welche geheimnisvolle Verbindung zwischen dem Magier und Calcifer besteht, dem Dämon, dessen Kraft das wandelnde Schloss antreibt - und dass nur die alles verwandelnde Kraft der Liebe sie, Hauro und die übrigen Bewohner erlösen kann."
      },
      {
        "id": 508883,
        "title": "Der Junge und der Reiher",
        "originalTitle": "君たちはどう生きるか",
        "releaseYear": "2023",
        "posterPath": "/sLo0lyBCEntwdFFxcmf3K5l4qJf.jpg",
        "backdropPath": "/75nSb1fbWooipwcSU5bUttiOriI.jpg",
        "voteAverage": 7.4,
        "overview": "Nachdem seine Mutter bei einem Luftangriff im Zweiten Weltkrieg umgekommen ist, muss der elfjährige Mahito Tokio verlassen. Er zieht zu seinem Vater und dessen neuer Frau in ein altes Herrenhaus. Isoliert von der Welt beginnt Mahito, die verzauberten Landschaften, die sein neues Zuhause umgeben, zu erforschen und begegnet einem mysteriösen Graureiher, der hartnäckig an seiner Seite bleibt."
      }
    ]
  },
  {
    "id": "david-fincher",
    "name": "David Fincher Collection",
    "category": "director",
    "tagline": "Düstere Psycho-Thriller und cineastische Perfektion",
    "description": "Se7en, Fight Club, Gone Girl und Zodiac: Die kompromisslosesten Meisterwerke des modernen Kinos.",
    "backdropPath": "/i5H7zusQGsysGQ8i6P361Vnr0n2.jpg",
    "posterPath": "/79tFIrbMweqs52PxForIRJRFCIW.jpg",
    "movies": [
      {
        "id": 807,
        "title": "Sieben",
        "originalTitle": "Se7en",
        "releaseYear": "1995",
        "posterPath": "/79tFIrbMweqs52PxForIRJRFCIW.jpg",
        "backdropPath": "/i5H7zusQGsysGQ8i6P361Vnr0n2.jpg",
        "voteAverage": 8.4,
        "overview": "Der besonnene Detective Somerset ist ein Kriminologe der „alten Schule“. Zusammen mit seinem neuen Kollegen, dem Heißsporn Mills, wird er auf den ungewöhnlichsten und erschreckendsten Fall seiner Laufbahn angesetzt. Ein unbekannter Serienkiller versucht scheinbar, die Stadt von allen Sünden zu befreien. Er tut dies, indem er auf bestialische Weise für jede der sieben Todsünden einen symbolischen Ritualmord begeht."
      },
      {
        "id": 550,
        "title": "Fight Club",
        "originalTitle": "Fight Club",
        "releaseYear": "1999",
        "posterPath": "/5sLBZtBzmL9Xd5MdGyqymgM9kPY.jpg",
        "backdropPath": "/c6OLXfKAk5BKeR6broC8pYiCquX.jpg",
        "voteAverage": 8.4,
        "overview": "Ein Yuppie findet beim charismatischen Tyler Durden Unterschlupf, nachdem seine Wohnung in die Luft gejagt wird. Ein Gerangel zwischen den beiden entwickelt sich zu einer Schlägerei, die mit der Erkenntnis endet, dass man sich nach einer ordentlichen Portion Prügel einfach besser fühlt. Der \"Fight Club\" ist geboren. Immer mehr Männer versammeln sich, um sich zu schlagen - und gestärkt in den Alltag zu gehen. Wie ein Virus greift das Konzept um sich, doch für Tyler ist der Kampfverein nur die erste Stufe, um die USA in die Knie zu zwingen."
      },
      {
        "id": 1949,
        "title": "Zodiac - Die Spur des Killers",
        "originalTitle": "Zodiac",
        "releaseYear": "2007",
        "posterPath": "/zlwYIkL5KfEHOXMlJrIHG1LLgCa.jpg",
        "backdropPath": "/3zCPI4JFc54xvLaJ71oI2KoP3az.jpg",
        "voteAverage": 7.5,
        "overview": "In der sonnigen Bay Area San Franciscos beginnt 1968 eine grausame Mordserie. Der unbekannte Killer lauert verliebten Pärchen auf und bringt sie um. Anschließend führt er Polizei und Presse mit kryptischen Briefen, in denen er sich Zodiac nennt und seiner Untaten brüstet, an der Nase herum. Zeitungsreporter und Fahnder aus vier Distrikten suchen nach dem Mörder. Als ein Teenager seine Attacken überlebt und ihn als weiß Maskierten beschreibt, bricht Panik in der Stadt aus. Der unlösbare Fall wird bald zur Obsession für die vier Detectives."
      },
      {
        "id": 4922,
        "title": "Der seltsame Fall des Benjamin Button",
        "originalTitle": "The Curious Case of Benjamin Button",
        "releaseYear": "2008",
        "posterPath": "/cbh6mV3BMPHmYd2diXjxicnoDF5.jpg",
        "backdropPath": "/2fswjyrY3GEzeoVn6mF8pNeNcgf.jpg",
        "voteAverage": 7.6,
        "overview": "Benjamin Button, der zu Zeiten des 1.Weltkriegs auf die Welt kommt ist nicht wie jedes andere Baby, er erblickt das Licht der Welt mit dem Gesicht eines Greises. Und während er innerlich heranwächst, wird sein Körper mit der Zeit immer jünger. Damit will sein Vater nach dem Tod seiner Mutter im Kindbett nichts zu tun haben und setzt den Jungen aus, doch seine Finderin Queenie nimmt ihn stattdessen auf, wo der Junge in einem Altersheim unter seinesgleich (zumindest optisch) heranwächst. Dort begegnet er auch der jungen Daisy, die die große Liebe seines Lebens werden soll, doch Benjamins junger Geist steckt in einem alten Körper und es steht zu befürchten, daß er als körperlich junger Mann schon von geistigem Verfall befallen sein wird. Button zieht in die Welt hinaus in dem Bewußtsein, daß er nur an einem Punkt in seinem Leben mit Daisy auf einer Höhe sein wird - doch das ist kein Grund, ein Leben nicht zu leben..."
      },
      {
        "id": 37799,
        "title": "The Social Network",
        "originalTitle": "The Social Network",
        "releaseYear": "2010",
        "posterPath": "/zXPTguS0IkxI0ZVuqMGSXpy9XUd.jpg",
        "backdropPath": "/1PXwh3nJzgRkkYnqfWInJNypeL4.jpg",
        "voteAverage": 7.4,
        "overview": "Harvard Student Mark Zuckerberg ist alles andere als sozial: der schüchterne, außergewöhnlich intelligente Computernerd hat außer seinem Kommilitonen Eduardo Saverin wenig Freunde und keinerlei Erfolg bei der Frauenwelt. Als Mark sich eines einsamen Herbstabends an seinen Computer setzt und beginnt sich in die Netzwerke seiner Universität zu hacken und Informationen über die weiblichen Studentinnen ins Netz zu stellen, weiß er selbst noch nicht, dass er etwas begonnen hat, was später als Internetportal Facebook Furore machen wird. Aber: Man kann keine 500 Millionen Freunde gewinnen, ohne sich auch ein paar Feinde zu machen - und in Zuckerbergs Fall fallen diese oftmals in ein und dieselbe Person. So ist der Weg an die Spitze des Multimillionen Dollar Facebook-Imperiums nicht nur gesäumt mit Partys und (sexuellen) Erfolgen, sondern auch mit Verrat und diversen Klagen."
      },
      {
        "id": 210577,
        "title": "Gone Girl - Das perfekte Opfer",
        "originalTitle": "Gone Girl",
        "releaseYear": "2014",
        "posterPath": "/r58gYlPtzeTtGYqUiihQEt7N4iu.jpg",
        "backdropPath": "/iWak7wT0j6ycCc8lKr4NBz9c7n5.jpg",
        "voteAverage": 7.9,
        "overview": "Ein warmer Sommermorgen in Missouri: Nick und Amy wollten heute eigentlich ihren fünften Hochzeitstag feiern, doch Amy ist plötzlich verschwunden. Als sie nicht wieder auftaucht, gerät Nick ins Visier der Polizei. Der Verlassene besteht jedoch auf seine Unschuld, verstrickt sich aber immer mehr in ein Netz aus Lügen und Verrat. Nach und nach tauchen Indizien auf, die darauf hindeuten, dass Amy Angst vor ihrem Mann hatte. Doch auch Amys Weste ist nicht so rein wie angenommen. Durch den Fund ihres Tagebuchs kommen dunkle Dinge ans Licht, die niemand jemals von der vermeintlich perfekten Frau erwartet hätte. Ob Amy überhaupt noch am Leben ist, bleibt weiterhin unklar…"
      }
    ]
  },
  {
    "id": "matrix",
    "name": "The Matrix Saga",
    "category": "franchise",
    "tagline": "Folge dem weißen Kaninchen",
    "description": "Die Wachowski-Trilogie, die das Sci-Fi- und Action-Kino für immer revolutioniert hat.",
    "backdropPath": "/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    "posterPath": "/iVmDLujHcV1zaMnaahKWn4TcCS6.jpg",
    "movies": [
      {
        "id": 603,
        "title": "Matrix",
        "originalTitle": "The Matrix",
        "releaseYear": "1999",
        "posterPath": "/iVmDLujHcV1zaMnaahKWn4TcCS6.jpg",
        "backdropPath": "/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
        "voteAverage": 8.3,
        "overview": "Der Hacker Neo wird übers Internet von einer geheimnisvollen Untergrund-Organisation kontaktiert. Der Kopf der Gruppe – der gesuchte Terrorist Morpheus – weiht ihn in ein entsetzliches Geheimnis ein: Die Realität, wie wir sie erleben, ist nur eine Scheinwelt. In Wahrheit werden die Menschen längst von einer unheimlichen virtuellen Macht beherrscht – der „Matrix“, deren Agenten Neo bereits im Visier haben …"
      },
      {
        "id": 604,
        "title": "Matrix Reloaded",
        "originalTitle": "The Matrix Reloaded",
        "releaseYear": "2003",
        "posterPath": "/eq7GAThE7piM4SsUIgRJQzU4lLB.jpg",
        "backdropPath": "/ihOJcrorpDQtHTzIOrobbOhpJsj.jpg",
        "voteAverage": 7.1,
        "overview": "Die Wächter schwärmen aus. Smith klont sich. Neo fliegt … aber vielleicht kann selbst der Auserwählte mit seinen atemberaubenden neuen Fähigkeiten den Angriff der Maschinen nicht mehr aufhalten.  Neo. Morpheus. Trinity. Zurück im spannenden zweiten Kapitel der Matrix-Trilogie treffen sie auf außergewöhnliche Verbündete: Gemeinsam bekämpfen sie ihre Gegner, die sich klonen, durch Upgrades immer stärker werden und die letzte Festung der Menschheit belagern."
      },
      {
        "id": 605,
        "title": "Matrix Revolutions",
        "originalTitle": "The Matrix Revolutions",
        "releaseYear": "2003",
        "posterPath": "/8lVaiIfbyZ5Oe3nLJoeAVRUXKAb.jpg",
        "backdropPath": "/533xAMhhVyjTy8hwMUFEt5TuDfR.jpg",
        "voteAverage": 6.8,
        "overview": "Die letzte Schlacht gegen die Maschinen kämpfen Neo, der Auserwählte, Rebellionsführer Morpheus und ihre Verbündeten – ein Krieg, der in den Ruinen der realen Welt geführt wird, der das Schicksal der Menschheit besiegelt und dessen Sieg in den Händen von Neo liegt, der seinerseits eine Reihe von Überraschungen zu erwarten hat."
      },
      {
        "id": 624860,
        "title": "Matrix Resurrections",
        "originalTitle": "The Matrix Resurrections",
        "releaseYear": "2021",
        "posterPath": "/hF7jgEhP4ypR2oS5BQD1pxbg7QY.jpg",
        "backdropPath": "/eNI7PtK6DEYgZmHWP9gQNuff8pv.jpg",
        "voteAverage": 6.3,
        "overview": "Thomas Anderson lebt ein normales Leben, arbeitet für eine große Firma und geht regelmäßig zur Therapie, wo sein Therapeut versucht, ihm seine Traumata auszutreiben. Denn Thomas hat Probleme damit, Realität und Fiktion auseinanderzuhalten. Er kann doch nicht wirklich einst als Auserwählter Neo in den Krieg gegen die Maschinen gezogen sein, oder?"
      }
    ]
  },
  {
    "id": "jason-bourne",
    "name": "Jason Bourne Filmreihe",
    "category": "franchise",
    "tagline": "Sie gaben ihm ein Gedächtnis – er gab ihnen den Krieg",
    "description": "Treadstone, Blackbriar und knallharte Nahkämpfe: Die revolutionäre Spionage-Reihe mit Matt Damon.",
    "backdropPath": "/fE7RqvVHbGHjBC9NjIjlLh2t4zK.jpg",
    "posterPath": "/fvolOVhsJnKGK8HYUhgQ7tuIsIh.jpg",
    "subGroupLabel": "Hauptdarsteller",
    "movies": [
      {
        "id": 2501,
        "title": "Die Bourne Identität",
        "originalTitle": "The Bourne Identity",
        "releaseYear": "2002",
        "posterPath": "/fvolOVhsJnKGK8HYUhgQ7tuIsIh.jpg",
        "backdropPath": "/kJaRWmy1BGq3pHyE94LOTteiHer.jpg",
        "voteAverage": 7.5,
        "overview": "Ein junger Mann wird halb tot, mit 2 Kugeln im Rücken und totaler Amnesie von Fischern aus dem Mittelmeer gezogen. Die Suche nach seinem Ich und seiner Vergangenheit führt ihn nach Zürich, wo er in einem Schließfach Hinweise auf seine Identität findet. Er ist Jason Bourne und auf der Flucht vor seinem ehemaligen Arbeitgeber, der CIA. Schon haben sich Agenten an seine Versen geheftet um ihn aus dem Weg zu räumen, doch mit Hilfe der Touristin Marie gelingt ihm fürs erste die Flucht...",
        "mediaType": "movie",
        "subGroup": "Matt Damon"
      },
      {
        "id": 2502,
        "title": "Die Bourne Verschwörung",
        "originalTitle": "The Bourne Supremacy",
        "releaseYear": "2004",
        "posterPath": "/zKYKQR3rn1ng9R3MwdKNW3ZWrLd.jpg",
        "backdropPath": "/fE7RqvVHbGHjBC9NjIjlLh2t4zK.jpg",
        "voteAverage": 7.3,
        "overview": "Jason Bourne und seine Lebensgefährtin Marie leben zurückgezogen in Indien, doch der immer noch unter Amnesie leidende Jason wird jede Nacht von Alpträumen gequält. Als in Berlin zwei Agenten getötet werden, schiebt man ihm die Schuld in die Schuhe. Wieder setzt die CIA Agenten auf Bourne an und er und Marie müssen flüchten. Doch als die CIA-Killer Marie töten dreht Jason den Spieß um...",
        "mediaType": "movie",
        "subGroup": "Matt Damon"
      },
      {
        "id": 2503,
        "title": "Das Bourne Ultimatum",
        "originalTitle": "The Bourne Ultimatum",
        "releaseYear": "2007",
        "posterPath": "/jHRDOX7WXcW8udRInTthlgnXYa8.jpg",
        "backdropPath": "/qiBILuWhv7ipF0pxiEqIJdkQzj8.jpg",
        "voteAverage": 7.4,
        "overview": "Um das dunkle Kapitel seiner Vergangenheit endlich auszulöschen, muss Jason Bourne sich dieser stellen. Das Projekt, welches ihn erschuf, wird auch weiterhin illegal fortgesetzt. Bourne macht sich daran, den Mord an seiner Freundin zu rächen. Unterstützt wird er dabei von Nicki, einer ehemaligen Agentin und der CIA-Agentin Landy. Doch auch der CIA-Chef Vosen hat seine Killer schon auf Bourne angesetzt, damit alle Gefahren für die Weiterführung des Projekts beseitigt werden.",
        "mediaType": "movie",
        "subGroup": "Matt Damon"
      },
      {
        "id": 49040,
        "title": "Das Bourne Vermächtnis",
        "originalTitle": "The Bourne Legacy",
        "releaseYear": "2012",
        "posterPath": "/h9FIsXXJWETKoQglfJskFSQXf6a.jpg",
        "backdropPath": "/akNBILfG0vh7WhuzjA1bXfrgpYI.jpg",
        "voteAverage": 6.3,
        "overview": "Jason Bourne war nicht alleine: Tatsächlich war er nur einer von vielen Agenten, die beim Treadstone-Programm zu einer willenlosen Tötungsmaschine umprogrammiert wurden. Zu ihnen gehörte auch Aaron Cross, ein Agent, der als verschwunden galt - bis er, wie Bourne, unvermittelt mit gelöschtem Gedächtnis wieder auftaucht und beginnt, Fragen zu stellen. Das sorgt für Panik bei den Verantwortlichen innerhalb des CIA, denn Aaron Cross ist bekannt dafür, noch viel gefährlicher zu sein als Jason Bourne.",
        "mediaType": "movie",
        "subGroup": "Jeremy Renner"
      },
      {
        "id": 324668,
        "title": "Jason Bourne",
        "originalTitle": "Jason Bourne",
        "releaseYear": "2016",
        "posterPath": "/9bijYuGTAiTczZvfJ9N4AZ4wlRF.jpg",
        "backdropPath": "/7mHeyU0a538bgguOeF57I8ZroSk.jpg",
        "voteAverage": 6.4,
        "overview": "Nachdem Jason Bourne nicht nur sein Gedächtnis, sondern auch seine Freundin verloren hat und einen eigenen Feldzug gegen die ihn jagende CIA antrat, um endlich hinter das Geheimnis seiner Vergangenheit zu gelangen, ist er mithilfe von Nicky Parsons  untergetaucht. Doch das Leben eines auf der Flucht lebenden Agenten mit besonders modifizierten Fähigkeiten kann nie lange ruhig bleiben. Denn inzwischen weiß Jason Bourne zwar, wer er ist, aber nicht, was diejenigen, die ihn erschaffen haben, mit ihm vorhatten. Also versucht er – verfolgt von der CIA – die versteckten Wahrheiten in seiner Vergangenheit zu finden.",
        "mediaType": "movie",
        "subGroup": "Matt Damon"
      }
    ]
  },
  {
    "id": "mission-impossible",
    "name": "Mission: Impossible Saga",
    "category": "franchise",
    "tagline": "Ihre Mission, sollten Sie sie annehmen...",
    "description": "Ethan Hunt und die IMF im Kampf gegen globale Bedrohungen mit den spektakulärsten Stunts der Kinogeschichte.",
    "backdropPath": "/5jnoAA74Qwb5w6B9FMvnc20n6Ie.jpg",
    "posterPath": "/sXzh9I53LWGbVqBucXiHMLXlVGm.jpg",
    "movies": [
      {
        "id": 954,
        "title": "Mission: Impossible",
        "originalTitle": "Mission: Impossible",
        "releaseYear": "1996",
        "posterPath": "/dNClI7niLaky8fS96fO5JF2UvgR.jpg",
        "backdropPath": "/sra8XnL96OyLHENcglmZJg6HA8z.jpg",
        "voteAverage": 7,
        "overview": "Als eine Liste mit den Codenamen verdeckter Top-Agenten zum Verkauf angeboten wird, soll ein Team von Spezialagenten den Verräter auf frischer Tat überführen.Cruise spielt den Geheimagenten Ethan Hunt, der miterleben muss, wie seine Kollegen bei diesem Einsatz zu Tode kommen. Bei einem Treffen mit seinem Kontaktmann der CIA erkennt Hunt, daß hinter der Mission ein perfides Doppelspiel steckt. Als Überlebenden wird ihm die Schuld am Tod seines Teams angehängt. Um seine Unschuld zu beweisen, muß Hunt den wahren Maulwurf finden. Ob auf der Flucht vor Killerkommandos der Regierung, beim Eindringen in den Hochsicherheitstrakt der CIA oder gar am Dach eines Hochgeschwindigkeitszuges festgeklammert, Hunt muß alles daransetzen, seinen Verfolgern stets einen Schritt voraus zu sein und der schrecklichen Wahrheit Schritt für Schritt näher zu kommen...",
        "mediaType": "movie"
      },
      {
        "id": 955,
        "title": "Mission: Impossible II",
        "originalTitle": "Mission: Impossible II",
        "releaseYear": "2000",
        "posterPath": "/egqhogOAaR5nuljs89mVRJWCSyL.jpg",
        "backdropPath": "/24DZfupDlhXeTchmcOkoGRhP5Vg.jpg",
        "voteAverage": 6.1,
        "overview": "Agent Ethan Hunt genießt gerade seinen Urlaub beim Freiklettern, als ihn eine vom Hubschrauber überbrachte Nachricht zur Arbeit zurückruft: Der kriminelle Ex-Kollege Sean Ambrose hat mit seiner Gang ein todbringendes Virus in seinen Besitz gebracht. Nun gilt es, den Verräter schleunigst ausfindig und dingfest zu machen. Deshalb macht sich Ethan gemeinsam mit dem Computer-Genie Luther, dem Australier Billy und der attraktiven Meisterdiebin Nyah an die unmöglich scheinende Mission, das Virus zurückzuholen.",
        "mediaType": "movie"
      },
      {
        "id": 956,
        "title": "Mission: Impossible III",
        "originalTitle": "Mission: Impossible III",
        "releaseYear": "2006",
        "posterPath": "/oEOuuYZ82Geduj8dlNEdL7SRPwr.jpg",
        "backdropPath": "/bYKeB9uUcPmvikjouEEQ86uvPw9.jpg",
        "voteAverage": 6.8,
        "overview": "Ethan Hunt hat sich zur Ruhe gesetzt und möchte mit der süßen Julia eine Familie gründen. Doch dann ruft man ihn zu einer allerletzten Mission. Hunts Kollegin Lindsey ist in die Fänge des gemeingefährlichen Psychopathen Owen Davian geraten. Die folgende interkontinentale Hatz führt den Superagenten über Berlin und den Vatikan bis ins fernöstliche Schanghai, wo es zum Showdown kommt. Dort muss Hunt seine inzwischen von Davian entführte Julia befreien und eine Zeitbombe, die unter seiner Schädeldecke tickt, deaktivieren.",
        "mediaType": "movie"
      },
      {
        "id": 56292,
        "title": "Mission: Impossible - Phantom Protokoll",
        "originalTitle": "Mission: Impossible - Ghost Protocol",
        "releaseYear": "2011",
        "posterPath": "/qW9vtDoRyeslZDX1i8zdQckw8Q4.jpg",
        "backdropPath": "/hqyjzDRCs1N5gEsh2gklzPdsEFD.jpg",
        "voteAverage": 7.1,
        "overview": "Bei einem Einsatz des IMF im Kreml kommt es zu einem folgenschweren Zwischenfall: IMF-Anführer Ethan Hunt wird Zeuge eines verheerenden Bombenattentats, das der IMF in die Schuhe geschoben wird. Die Regierung verleugnet die Elite-Abteilung und initiiert das Phantom-Protokoll, ihr einziger Kontakt zur Kommandostruktur wird ermordet. Mit seinen Leuten geht Ethan in den Untergrund, um auf eigene Faust den Drahtzieher zu stellen. Die Spur führt nach Dubai, wo sie dem undurchschaubaren Hendricks auf die Schliche kommen.",
        "mediaType": "movie"
      },
      {
        "id": 177677,
        "title": "Mission: Impossible - Rogue Nation",
        "originalTitle": "Mission: Impossible - Rogue Nation",
        "releaseYear": "2015",
        "posterPath": "/t4MxhCDLlWPg0ZhSJFD4n4ElKpD.jpg",
        "backdropPath": "/vYIUN5rrCncHFY8WvcuXQlM4hk5.jpg",
        "voteAverage": 7.2,
        "overview": "Nachdem das Pentagon die Impossible Missions Force aufgelöst hat, ist Ethan Hunt auf sich allein gestellt. Doch gerade jetzt hat der ehemalige IMF-Agent die Spur der geheimnisvollen und hochgefährlichen Organisation „Syndikat“ aufgenommen, die sich schon bald als sein mächtigster Gegner erweist. Aus dem Untergrund heraus operiert das „Syndikat“ mit bestens ausgebildeten Spezialagenten und diese scheinen Hunt immer einen Schritt voraus zu sein – und ihre Mission ist teuflisch: Sie wollen durch gezielte Anschläge eine neue Weltordnung schaffen und alle ehemaligen Mitglieder der IMF auslöschen, um ihre Pläne ungestört verwirklichen zu können. In offizieller Mission der Regierung oder nicht, Ethan Hunt kann nicht zusehen, wie der Terror immer weiter um sich greift, und reaktiviert sein einzigartiges Team. Unerwartete Hilfe bekommt das Quartett von der geheimnisvollen Agentin Ilsa Faust – doch auf welcher Seite steht sie wirklich?",
        "mediaType": "movie"
      },
      {
        "id": 353081,
        "title": "Mission: Impossible - Fallout",
        "originalTitle": "Mission: Impossible - Fallout",
        "releaseYear": "2018",
        "posterPath": "/sXzh9I53LWGbVqBucXiHMLXlVGm.jpg",
        "backdropPath": "/5jnoAA74Qwb5w6B9FMvnc20n6Ie.jpg",
        "voteAverage": 7.5,
        "overview": "Mit der Wiederbeschaffung gestohlenen Plutoniums beauftragt, stellt Ethan Hunt das Wohl seines Teams über die Vollendung der Mission, wodurch die Nuklearwaffen in die Hände der Apostel, einem tödlichen Netzwerk hochspezialisierter Terroristen, gelangen. Um den drohenden atomaren Holocaust zu verhindern, sind Ethan und sein IMF-Team zur Zusammenarbeit mit dem draufgängerisch agierenden CIA-Agenten Walker gezwungen. Es beginnt ein tödlicher Wettlauf gegen die Zeit ...",
        "mediaType": "movie"
      },
      {
        "id": 575264,
        "title": "Mission: Impossible - Dead Reckoning Teil Eins",
        "originalTitle": "Mission: Impossible - Dead Reckoning Part One",
        "releaseYear": "2023",
        "posterPath": "/nrQiVtkneYx9doR1ARG6HDrImpv.jpg",
        "backdropPath": "/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
        "voteAverage": 7.5,
        "overview": "Ethan Hunt begibt sich auf seine siebte und bislang unmöglichste Mission: Gemeinsam mit seinem IMF-Team soll er eine neuartige Waffe ausfindig machen, die dazu in der Lage ist, die Menschheit an den Rand des Dritten Weltkriegs zu führen – und sieht sich gleich mit mehreren mächtigen Gegnern konfrontiert. Denn zahlreiche Schurken wollen ebenfalls in den Besitz des Schlüssels gelangen, der ihnen die Kontrolle über die mysteriöse Waffe geben würde. Doch der gefährlichste Feind hat weder einen Namen noch ein Gesicht: eine künstliche Intelligenz, die den Agenten immer einen Schritt voraus ist, aber selbst vollkommen unberechenbar agiert. Ein globaler Wettlauf um das Schicksal des Planeten beginnt – der Ethan Hunt gleichzeitig vor einige folgenschwere persönliche Entscheidungen stellt …",
        "mediaType": "movie"
      }
    ]
  },
  {
    "id": "john-wick",
    "name": "John Wick Filmreihe",
    "category": "franchise",
    "tagline": "Der Boogeyman kehrt zurück: Gun-Fu in Reinkultur",
    "description": "Von der Rache für einen Welpen bis zum weltweiten Krieg gegen die Hohe Kammer: Keanu Reeves als unaufhaltsamer Auftragskiller John Wick, plus die Prequel-Serie The Continental.",
    "backdropPath": "/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    "posterPath": "/k4ue90EztFrXbabTKJmMIPQmhET.jpg",
    "subGroupLabel": "Format",
    "movies": [
      {
        "id": 245891,
        "title": "John Wick",
        "originalTitle": "John Wick",
        "releaseYear": "2014",
        "posterPath": "/erBsqm9gNvq7pQTPrkXdRpF6CFw.jpg",
        "backdropPath": "/ff2ti5DkA9UYLzyqhQfI2kZqEuh.jpg",
        "voteAverage": 7.5,
        "overview": "John Wick genießt seinen frühen Ruhestand in der Vorstadt. Doch als seine Frau einer tödlichen Krankheit erliegt, verfällt er in Trauer. Nur sein Hund bleibt ihm noch als Gefährte. Als eines Tages jedoch drei russische Gangster in sein Haus einsteigen und seinen treuen Begleiter töten, holt ihn seine finstere Vergangenheit ein, war er doch früher der Top-Auftragskiller an der Ostküste. So tauscht er schließlich die Vorstadtidylle gegen jede Menge Feuerkraft und macht sich, auf Rache sinnend, auf die Suche nach den Einbrechern. Einer von ihnen ist Iosef Tarasov, der Sohn des einflussreichen Verbrecherbosses Viggo Tarasov, für den Wick selbst einmal gearbeitet hatte. Doch für Freundschaft ist kein Platz in dem Rachefeldzug und so hat er bald auch den ehemaligen Kollegen Marcus an seinen Fersen hängen...",
        "mediaType": "movie",
        "subGroup": "Filme"
      },
      {
        "id": 324552,
        "title": "John Wick: Kapitel 2",
        "originalTitle": "John Wick: Chapter 2",
        "releaseYear": "2017",
        "posterPath": "/7JvUTRGuuS6G15OVRCe7AKduTYP.jpg",
        "backdropPath": "/Aa9Lx6gotP0szl9tlt5SPCN08oF.jpg",
        "voteAverage": 7.3,
        "overview": "Nur noch das Auto zurückholen, dann will sich John Wick zurück in den Ruhestand verabschieden. Doch nachdem der Ex-Auftragskiller sein geliebtes Gefährt wieder und sich mit Abram geeinigt hat, dem Bruder seiner Nemesis Viggo Tarassow geht es für Wick erst richtig los. Wicks ehemaliger Kollege Santino steht vor der Tür und gibt ihm eine mit Blut besiegelte Münze. Wie der Einzelkämpfer weiß, steht das Geldstück für ein Versprechen, das Wick einst gab – das Versprechen von Hilfe als Gegenleistung für einen alten Gefallen. Und auch wenn der Killer seine Ruhe haben will, kann er schließlich nicht anders, als seine Zusicherung einzulösen, denn andernfalls droht ihm der Tod. Wick geht nach Rom, wo Santinos Schwester Gianna in die Riege der einflussreichsten Gangsterbosse kommen will...",
        "mediaType": "movie",
        "subGroup": "Filme"
      },
      {
        "id": 458156,
        "title": "John Wick: Kapitel 3",
        "originalTitle": "John Wick: Chapter 3 - Parabellum",
        "releaseYear": "2019",
        "posterPath": "/rXdNL3NhmDZ8w4scJYxUDSpaJz.jpg",
        "backdropPath": "/vVpEOvdxVBP2aV166j5Xlvb5Cdc.jpg",
        "voteAverage": 7.4,
        "overview": "John Wick befindet sich auf der Flucht. Es sind nicht nur 14 Millionen Dollar auf seinen Kopf ausgesetzt, er hat auch die Regel aller Regeln gebrochen: er hat einen anderen Menschen im Bereich des Continental Hotels umgebracht. Eigentlich müsste er deswegen längst tot sein, doch Hotelmanager Winston gewährte ihm für eine Stunde Gnade, bevor alle Folgen eintreten und Wick offiziell aus der Killergemeinschaft ausgeschlossen wird. Wenn John überleben will, muss er sich seinen Weg aus New York City freikämpfen und irgendwo auf der Welt Zuflucht finden. Helfen kann ihm dabei nur seine alte Bekannte Sofia und die Frau, die ihn einst aufgezogen und beschützt hat...",
        "mediaType": "movie",
        "subGroup": "Filme"
      },
      {
        "id": 603692,
        "title": "John Wick: Kapitel 4",
        "originalTitle": "John Wick: Chapter 4",
        "releaseYear": "2023",
        "posterPath": "/uDFv0wYODTdRUvljRMs3LaX9nq3.jpg",
        "backdropPath": "/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
        "voteAverage": 7.7,
        "overview": "John Wick nimmt es mit seinen bisher tödlichsten Widersachern auf. Während das Kopfgeld auf ihn immer höher wird, zieht Wick in einen weltweiten Kampf gegen die mächtigsten Akteure der Unterwelt – von New York über Paris und Osaka bis nach Berlin …",
        "mediaType": "movie",
        "subGroup": "Filme"
      },
      {
        "id": 72710,
        "title": "The Continental - Aus der Welt von John Wick",
        "originalTitle": "The Continental: From the World of John Wick",
        "releaseYear": "2023",
        "posterPath": "/jtFYRDvDlCFRV6cQpxXeNXK08vy.jpg",
        "backdropPath": "/1gajPADcRyzmYvfAefbJwhCy4bk.jpg",
        "voteAverage": 7.4,
        "overview": "New York, Mitte der 1970er Jahre: Der noch junge Hotelmanager Winston Scott (Colin Woodell) muss sich seiner Vergangenheit stellen, die er glaubte, hinter sich gelassen zu haben. Dabei begibt er sich auf einen tödlichen Weg durch die mysteriöse Unterwelt New Yorks und versucht, das berühmte Continental Hotel in seine Gewalt zu bringen, das als Treffpunkt für die gefährlichsten Verbrecher der Welt dient …",
        "mediaType": "tv",
        "subGroup": "Serie"
      }
    ]
  }
];

export function getAllCollections(): CollectionUniverse[] {
  return COLLECTIONS_DATA;
}

export function getCollectionById(id: string): CollectionUniverse | undefined {
  return COLLECTIONS_DATA.find((c) => c.id === id);
}
