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
}

export interface CollectionUniverse {
  id: string;
  name: string;
  category: "franchise" | "director";
  tagline: string;
  description: string;
  backdropPath: string | null;
  posterPath: string | null;
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
    "id": "marvel-avengers",
    "name": "Marvel Cinematic Universe: Avengers Saga",
    "category": "franchise",
    "tagline": "Die mächtigsten Helden der Welt",
    "description": "Das revolutionäre Comic-Universum von Iron Man bis zum ultimativen Showdown in Avengers: Endgame.",
    "backdropPath": "/cKvDv2LpwVEqbdXWoQl4XgGN6le.jpg",
    "posterPath": "/wyEqQ7dvnYPR0z8M8ZDW5VSvRwZ.jpg",
    "movies": [
      {
        "id": 1726,
        "title": "Iron Man",
        "originalTitle": "Iron Man",
        "releaseYear": "2008",
        "posterPath": "/wyEqQ7dvnYPR0z8M8ZDW5VSvRwZ.jpg",
        "backdropPath": "/cKvDv2LpwVEqbdXWoQl4XgGN6le.jpg",
        "voteAverage": 7.7,
        "overview": "Der Großindustrielle und Erfinder Tony Stark weiß zu leben: Als Milliardär liegen ihm die Frauen zu Füßen, er feiert Partys im Privatjet und verspielt Riesensummen im Casino, während seine Rüstungsfirma unter Obadiah Stane Rekordumsätze erzielt. Bei einem Waffentestlauf in Afghanistan wird er jedoch Opfer eines Bombenanschlags. Stark überlebt schwer verletzt und wird von einer Gruppe Aufständischer unter Führung des Warlords Raza dazu gezwungen, eine Superwaffe zu entwickeln. Es gelingt ihm jedoch, heimlich eine eiserne Schutzrüstung zu bauen, die ihn dank neuster Technologie zu Superkräften befähigt. Nach einer spektakulären Flucht zurück in die USA muss sich der Iron Man allerdings einem ersten übermächtigen Gegner stellen."
      },
      {
        "id": 1771,
        "title": "Captain America: The First Avenger",
        "originalTitle": "Captain America: The First Avenger",
        "releaseYear": "2011",
        "posterPath": "/osELOHV9IVKCIflUpJ60cN7mgP8.jpg",
        "backdropPath": "/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg",
        "voteAverage": 7,
        "overview": "1942 – die USA ziehen in den Kampf gegen Hitler-Deutschland. Steve Rogers wird auf Grund seines Gesundheitszustands als ungeeignet eingestuft. Mit Hilfe des Project: Rebirth soll er trotzdem in den Kampf gegen Nazis ziehen. Der kränkliche Steve wird in eine Art Super-Soldaten namens Captain America transformiert. Hilfe bekommt der neue Superheld dabei von seinem Freund Bucky Barnes. Gemeinsam kämpfen sie gegen Red Skul, Hitlers Geheimwaffe im Krieg gegen den Rest der Welt."
      },
      {
        "id": 24428,
        "title": "Marvel's The Avengers",
        "originalTitle": "The Avengers",
        "releaseYear": "2012",
        "posterPath": "/hGTqvK9WaI74szUDPMHXrrHfiH3.jpg",
        "backdropPath": "/gHLs7Fy3DzLmLsD4lmfqL55KGcl.jpg",
        "voteAverage": 8.1,
        "overview": "Nick Fury ist der Anführer der Organisation S.H.I.E.L.D., einer internationalen Friedensorganisation. Die Behörde ist ein Who's Who der Marvel Superhelden, mit Iron Man, Thor, Captain America, Hawkeye, dem Unglaublichen Hulk und Black Widow. Als die weltweite Sicherheit von Thors sinistrem Halbbruder Loki und seiner Schar bedroht wird, werden Nick Fury und sein Team all ihre Kräfte brauchen, um die Welt vor einer Katastrophe zu bewahren ..."
      },
      {
        "id": 100402,
        "title": "The Return of the First Avenger",
        "originalTitle": "Captain America: The Winter Soldier",
        "releaseYear": "2014",
        "posterPath": "/14vWmCoZHXajYmtqSsswWpSOdrd.jpg",
        "backdropPath": "/jJvrPQAHFKmz4pVano4UtWTsRgA.jpg",
        "voteAverage": 7.7,
        "overview": "Nach den Geschehnissen mit den Avengers in New York zieht sich Steve Rogers nach Washington zurück. Dort hat er nach wie vor Probleme, sich an das moderne Leben zu gewöhnen. Doch er wird wieder in den Einsatz berufen, als ein S.H.I.E.L.D.-Agent Ziel eines Angriffs wird. Dies ist nur der Beginn eines größeren Plans, der die ganze Welt in Gefahr bringen könnte. Steve kehrt als Captain America zurück und versucht mit Hilfe von Agentin Romanoff, auch bekannt als Black Widow, die Verschwörung aufzuklären. Die Beiden erhalten zusätzliche Unterstützung vom Falken. Die Mission birgt einige Gefahren und die beiden werden oftmals Ziel von Attentaten. Doch die größte Gefahr ist der Gegner selbst: der Winter Soldier."
      },
      {
        "id": 118340,
        "title": "Guardians of the Galaxy",
        "originalTitle": "Guardians of the Galaxy",
        "releaseYear": "2014",
        "posterPath": "/9pbW0r2YIkyWCOieSAUPrmS9cDp.jpg",
        "backdropPath": "/uLtVbjvS1O7gXL8lUOwsFOH4man.jpg",
        "voteAverage": 7.9,
        "overview": "Nachdem der Abenteurer Peter Quill eine geheimnisvolle Kugel gestohlen hat, wird er das Opfer einer unerbittlichen Kopfgeldjagd mit Ronan the Accuser. Die Ziele des mächtigen Bösewichts bedrohen die Sicherheit des Universums. Um dem hartnäckigen Ronan und seinen Schergen zu entgehen, ist Quill gezwungen, einen nicht gerade einfach einzuhaltenden Waffenstillstand mit einem Quartett von ungleichen Außenseitern einzugehen - dazu gehört der waffenliebende Waschbär Rocket, der Baummensch Groot, die tödliche und rätselhafte Gamora und der rachsüchtige Drax the Destroyer. Als Peter dann die wahre Macht der Kugel und dessen Bedrohung für den Kosmos bewusst wird, muss er sein Bestes geben, um die bunt zusammengewürfelten Rivalen für einen letzten, verzweifelten Widerstand zu vereinen und eine Helden-Truppe aus ihnen machen - denn das Schicksal der Galaxie steht auf dem Spiel."
      },
      {
        "id": 99861,
        "title": "Avengers: Age of Ultron",
        "originalTitle": "Avengers: Age of Ultron",
        "releaseYear": "2015",
        "posterPath": "/woAP8YaiVIuo7YXTeqVQEhXBdfz.jpg",
        "backdropPath": "/kIBK5SKwgqIIuRKhhWrJn3XkbPq.jpg",
        "voteAverage": 7.3,
        "overview": "Milliardär, Lebemann und Genie Tony Stark aka Iron Man will ein inaktives Friedensprogramm in Gang bringen, doch dabei geht etwas schief. So taucht der niederträchtige Roboter-Bösewicht Ultron auf und verfolgt Pläne zur Ausrottung der Menschheit. Nun ist es an den Helden, sich wieder zu sammeln und das schreckliche Schicksal der Welt abzuwenden. Zusammen mit Iron Man treten Thor, Captain America, Hulk, Black Widow und Hawkeye dem fiesen Ultron entgegen und bekommen dabei Unterstützung von den ehemaligen S.H.I.E.L.D.-Agenten Nick Fury und Maria Hill. Außerdem kreuzen die geheimnisvollen und mit besonderen Fähigkeiten ausgestatteten Newcomer Wanda und Pietro Maximoff den Weg der Helden, wie auch ein alter Bekannter in neuer Gestalt: Vision. Die Rächer müssen ihre Kräfte vereinen, unsichere Allianzen schmieden und auf unerwartete Aktionen reagieren, um die Bewohner der Erde einmal mehr vor dem drohenden Untergang zu bewahren."
      },
      {
        "id": 271110,
        "title": "The First Avenger: Civil War",
        "originalTitle": "Captain America: Civil War",
        "releaseYear": "2016",
        "posterPath": "/7iB1ow4vPLRJ9UOnIwvEFQwRHHr.jpg",
        "backdropPath": "/7FWlcZq3r6525LWOcvO9kNWurN1.jpg",
        "voteAverage": 7.5,
        "overview": "Als bei einem Einsatz der Avengers in Lagos zwar der Diebstahl eines biologischen Kampfstoffes verhindert wird, dabei aber mehrere Zivilisten sterben, beschließen die Vereinten Nationen ein neues Gesetz, das die Avengers unter ihre Aufsicht bringen soll. Während Tony Stark alias Iron Man für eine Kontrolle der Superhelden votiert, stimmt Steve Rogers alias Captain America für ihre Unabhängigkeit. Auch die Teammitglieder sind uneinig und verteilen sich auf die beiden Wortführer. Als ein Bombenattentat auf jene UN-Versammlung verübt wird und man als vermeintlichen Schuldigen Steves alten Freund Bucky Barnes, nun als Winter Soldier bekannt, ausmacht, verschärft sich die Lage. Nachdem Steve Anweisungen missachtet und versucht Bucky auf eigene Faust zu stellen, damit dieser bei seiner Verhaftung nicht getötet wird, kommt es zu immer offeneren Animositäten zwischen den Superhelden ..."
      },
      {
        "id": 299536,
        "title": "Avengers: Infinity War",
        "originalTitle": "Avengers: Infinity War",
        "releaseYear": "2018",
        "posterPath": "/2hj7diAFcApL2YfWwjiYCuRI4WW.jpg",
        "backdropPath": "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "voteAverage": 8.2,
        "overview": "Der mächtige Titan Thanos  hat es sich zur Aufgabe gemacht das halbe Universum auszulöschen. Um diesen perfiden Plan Realität werden zu lassen, benötigt er allerdings zuerst alle sechs Infinity-Steine, die ihm in Verbindung mit einem speziell gefertigten Handschuh, gottgleiche Kräfte verleihen. Da sich unglücklicherweise auch auf der Erde zwei dieser Steine befinden, betraut er seine treu ergebene Black Order mit deren Beschaffung. Sowohl die Avengers, als auch die Guardians of the Galaxy und Thor erfahren jedoch von Thanos' Plänen und stellen sich dem Schurken entgegen. Doch mit einen derart mächtigen Gegner hatte es bisher keiner von ihnen zu tun..."
      },
      {
        "id": 299534,
        "title": "Avengers: Endgame",
        "originalTitle": "Avengers: Endgame",
        "releaseYear": "2019",
        "posterPath": "/ibO8Pj0aA1nwj3Q9FMpMcYZkdCA.jpg",
        "backdropPath": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "voteAverage": 8.2,
        "overview": "Thanos hat also tatsächlich Wort gehalten, seinen Plan in die Tat umgesetzt und die Hälfte allen Lebens im Universum ausgelöscht. Die Avengers? Machtlos. Iron Man und Nebula sitzen auf dem Planeten Titan fest, während auf der Erde absolutes Chaos herrscht. Doch dann finden Captain America und die anderen überlebenden Helden auf der Erde heraus, dass Nick Fury vor den verheerenden Ereignissen gerade noch ein Notsignal absetzen konnte, um Verstärkung auf den Plan zu rufen. Die Superhelden-Gemeinschaft bekommt mit Captain Marvel kurzerhand tatkräftige Unterstützung im Kampf gegen ihren vermeintlich übermächtigen Widersacher. Und dann ist da auch noch Ant-Man, der wie aus dem Nichts auftaucht und sich der Truppe erneut anschließt, um die ganze Sache womöglich doch noch zu einem guten Ende zu bringen …"
      },
      {
        "id": 634649,
        "title": "Spider-Man: No Way Home",
        "originalTitle": "Spider-Man: No Way Home",
        "releaseYear": "2021",
        "posterPath": "/iNKf4D0AzOj9GLq8ZyG3WZaqibL.jpg",
        "backdropPath": "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
        "voteAverage": 7.9,
        "overview": "Peter Parker ist demaskiert und kann sein normales Leben nicht mehr von den hohen Einsätzen als Superheld trennen. Als er Doctor Strange um Hilfe bittet, wird die Lage noch gefährlicher und er muss entdecken, was es wirklich bedeutet, Spider-Man zu sein."
      }
    ]
  },
  {
    "id": "james-bond-craig",
    "name": "James Bond 007 (Daniel Craig Ära)",
    "category": "franchise",
    "tagline": "Im Geheimdienst Ihrer Majestät",
    "description": "Der Neuanfang mit 007: Physisch, emotional und kompromisslos von Casino Royale bis Keine Zeit zu sterben.",
    "backdropPath": "/klJMCIblHLFwCuGjKz7tyOpekIC.jpg",
    "posterPath": "/uvigE215SzXdsEFPN0XRFR9RPiA.jpg",
    "movies": [
      {
        "id": 36557,
        "title": "James Bond 007 - Casino Royale",
        "originalTitle": "Casino Royale",
        "releaseYear": "2006",
        "posterPath": "/uvigE215SzXdsEFPN0XRFR9RPiA.jpg",
        "backdropPath": "/klJMCIblHLFwCuGjKz7tyOpekIC.jpg",
        "voteAverage": 7.6,
        "overview": "Sein erster Auftrag, nachdem er die Lizenz zum Töten erhalten hat, führt den MI6-Agenten James Bond nach Madagaskar, wo er auf den Terroristen Mollaka angesetzt wird. Zwar verläuft nicht alles nach Plan, doch als Bond auf eigene Faust weiter ermittelt, kommt er auf die Spur von Le Chiffre, dem Bankier einer weltweit operierenden Terror-Organisation. Dieser plant, das Vermögen seiner Organisation durch ein illegales Pokerspiel im „Casino Royale“ in Montenegro um ein Vielfaches zu erhöhen, wofür natürlich auch ein hoher Einsatz nötig ist. Der MI6 sieht daher die Chance, die Terroristen in den finanziellen Ruin zu treiben und beauftragt James Bond, die Pläne von Le Chiffre zunichte zu machen."
      },
      {
        "id": 10764,
        "title": "James Bond 007 - Ein Quantum Trost",
        "originalTitle": "Quantum of Solace",
        "releaseYear": "2008",
        "posterPath": "/5aFAFIQrB4uHfuEByUknFGRvLOE.jpg",
        "backdropPath": "/uGs5Z7dMguf7kxWubGFcp9EhKcy.jpg",
        "voteAverage": 6.3,
        "overview": "Nach dem Tod von Vesper Lynd versucht James Bond an die Hintermänner des Komplotts gegen Lynd zu kommen. Beim MI6 wird dazu Mr. White verhört, dem durch einen internen Verrat während des Verhörs die Flucht gelingt. Die Spur führt Bond nach Haiti. Dort gelangt er durch die attraktive Camille an den zwielichtigen Dominic Greene, der mit dem Komplott in Verbindung zu stehen scheint. Bond muss fortan nicht nur einmal um sein Leben bangen..."
      },
      {
        "id": 37724,
        "title": "James Bond 007 - Skyfall",
        "originalTitle": "Skyfall",
        "releaseYear": "2012",
        "posterPath": "/AkpcDSA2NQb0tlNyOs2h00qX0K0.jpg",
        "backdropPath": "/wkA622CCN2X0uwpgqYEOnUYEDf5.jpg",
        "voteAverage": 7.3,
        "overview": "Auf der Jagd nach einer Liste von Undercoveragenten, die mit diesem Dokument enttarnt und in den sicheren Tod geschickt werden könnten, stürzt James Bond, von einer Kugel getroffen, in eine tiefe Schlucht. Von Freund und Feind für tot gehalten, hält sich 007 versteckt, bis ihn ein Bombenanschlag auf seinen Geheimdienst zum Handeln zwingt. So kehrt Bond zum MI6 zurück, kämpft gegen einen unbekannten Gegner, der nur ein Ziel kennt: Dem britischen Geheimdienst empfindlich zu schaden und dessen Chefin M zu töten."
      },
      {
        "id": 206647,
        "title": "James Bond 007 - Spectre",
        "originalTitle": "Spectre",
        "releaseYear": "2015",
        "posterPath": "/zmSO6LBHJdVAnlgRHlBmIyVfm6L.jpg",
        "backdropPath": "/cCKU3EuiSKt6xsOI6gg5kiFgZYm.jpg",
        "voteAverage": 6.6,
        "overview": "James Bond erhält eine kryptische Nachricht aus seiner Vergangenheit, die ihn auf die Spur einer finsteren Organisation bringt. Bond muss immer mehr entdecken, dass es viele Täuschungen und Lügen gibt, die er entschlüsseln muss. Während sein Boss M mit anderen Problemen kämpft, mit politischen Kräften konfrontiert ist, die den ganzen Geheimdienst gefährden, erkennt Bond erst nach und nach die schreckliche Wahrheit hinter Spectre."
      },
      {
        "id": 370172,
        "title": "James Bond 007 - Keine Zeit zu sterben",
        "originalTitle": "No Time to Die",
        "releaseYear": "2021",
        "posterPath": "/bqq2dlwWAm5O5RVPGHVwwxhESK1.jpg",
        "backdropPath": "/x9td0NQha0t44K2qgcMipLOGjVi.jpg",
        "voteAverage": 7.3,
        "overview": "James Bond hat seine Lizenz zum Töten im Auftrag des britischen Geheimdienstes abgegeben und genießt seinen Ruhestand in Jamaika. Die friedliche Zeit nimmt ein unerwartetes Ende, als sein alter CIA-Kollege Felix Leiter auftaucht und ihn um Hilfe bittet. Ein bedeutender Wissenschaftler ist entführt worden und muss so schnell wie möglich gefunden werden. Was als simple Rettungsmission beginnt, erreicht bald einen bedrohlichen Wendepunkt, denn Bond kommt einem geheimnisvollen Gegenspieler auf die Spur, der im Besitz einer brandgefährlichen neuen Technologie ist."
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
  }
];

export function getAllCollections(): CollectionUniverse[] {
  return COLLECTIONS_DATA;
}

export function getCollectionById(id: string): CollectionUniverse | undefined {
  return COLLECTIONS_DATA.find((c) => c.id === id);
}
