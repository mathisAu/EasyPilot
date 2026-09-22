import { Mail, MessageCircleQuestion, Phone } from 'lucide-react';

const FAQ = [
  {
    question: 'Hoe lever ik een nieuw documenttype aan?',
    answer:
      'Ga naar "Documenten" en klik op "Nieuw documenttype aanleveren". Doorloop de stappen: geef aan van wie de documenten komen, upload een aantal voorbeelden, en kies welke gegevens wij eruit moeten halen.',
  },
  {
    question: 'Hoeveel voorbeelden moet ik aanleveren?',
    answer: 'Minimaal 1, maar bij voorkeur 5 tot 10 verschillende voorbeelden zodat EasyPilot het documenttype goed kan leren.',
  },
  {
    question: 'Wat betekent de status "Wordt ingeleerd"?',
    answer:
      'Dit betekent dat ons team het documenttype aan het inleren en testen is. Zodra het documenttype klaar is voor automatische verwerking, zetten wij het live.',
  },
  {
    question: 'Kan ik later nog extra voorbeelden toevoegen?',
    answer: 'Ja, open het documenttype in het overzicht en upload extra voorbeelden via de documentenlijst.',
  },
];

export function HelpPage() {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Klantportaal</p>
          <h1>Hulp</h1>
          <p className="page-description">Veelgestelde vragen en contactgegevens.</p>
        </div>
      </section>

      <section className="table-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Veelgestelde vragen</p>
            <h2>Hoe werkt EasyPilot?</h2>
          </div>
        </div>
        <div className="drawer-summary" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          {FAQ.map((item) => (
            <div key={item.question}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircleQuestion size={14} /> {item.question}
              </span>
              <strong style={{ fontWeight: 500 }}>{item.answer}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Mail size={21} />
        </div>
        <div>
          <strong>Kom je er niet uit?</strong>
          <p>Neem contact op met ons support-team, we helpen je graag verder.</p>
        </div>
        <a className="secondary-button" href="mailto:support@easypilot.nl">
          <Mail size={16} /> support@easypilot.nl
        </a>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Phone size={21} />
        </div>
        <div>
          <strong>Liever bellen?</strong>
          <p>Ma&ndash;vr van 9:00 tot 17:00 bereikbaar.</p>
        </div>
      </section>
    </>
  );
}
