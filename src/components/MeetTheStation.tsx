import { Badge } from './ui/Badge';

interface MeetTheStationProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  onOpenDesignLab: () => void;
}

export const MeetTheStation: React.FC<MeetTheStationProps> = ({
  onSelectHotspot,
  onOpenDesignLab,
}) => {
  const stationLocations = [
    {
      id: 'kiosk',
      title: 'Ticket Kiosk',
      subtitle: 'Missing Context Flaw',
      desc: 'Central self-service ticket dispenser. The form inputs vanish when focused, forcing travelers to memorize what was asked.',
      badgeText: 'HOTSPOT 1',
      badgeColor: '#FF8A1F',
      actionText: 'Explore Kiosk →',
      action: () => onSelectHotspot('kiosk'),
    },
    {
      id: 'board',
      title: 'Departure Board',
      subtitle: 'Confusing Feedback Flaw',
      desc: 'Overhead LED timetable. Errors are indicated with purely red borders without specific directions or next steps.',
      badgeText: 'HOTSPOT 2',
      badgeColor: '#FF3B30',
      actionText: 'Inspect Board →',
      action: () => onSelectHotspot('board'),
    },
    {
      id: 'desk',
      title: 'Help Desk',
      subtitle: 'Unclear Actions Flaw',
      desc: 'Station customer service desk. Confusing action hierarchy leaves travelers unsure which button commits their booking.',
      badgeText: 'HOTSPOT 3',
      badgeColor: '#8DDCFF',
      actionText: 'Check Desk →',
      action: () => onSelectHotspot('desk'),
    },
    {
      id: 'lab',
      title: 'Design Lab',
      subtitle: 'Interactive Sandbox',
      desc: 'The repair workshop where you flip switches for persistent labels, error messages, focus rings, and touch targets.',
      badgeText: 'SANDBOX',
      badgeColor: '#B6FFB2',
      actionText: 'Open Lab →',
      action: onOpenDesignLab,
    },
  ];

  return (
    <section className="meet-station-section" id="meet-station" aria-labelledby="meet-station-title">
      <div className="section-container">
        <div className="section-header">
          <Badge variant="sticker" color="#8DDCFF" rotate={-1}>
            STATION DIRECTORY
          </Badge>
          <h2 id="meet-station-title" className="section-title">
            Meet the Station
          </h2>
          <p className="section-subtitle">
            Every corner of the transit arcade conceals a real interface design problem waiting to be exposed and fixed.
          </p>
        </div>

        <div className="station-locations-grid">
          {stationLocations.map((loc) => (
            <div key={loc.id} className="location-card">
              <div className="location-card__top">
                <Badge variant="tag" color={loc.badgeColor}>
                  {loc.badgeText}
                </Badge>
              </div>
              <h3 className="location-card__title">{loc.title}</h3>
              <span className="location-card__subtitle">{loc.subtitle}</span>
              <p className="location-card__desc">{loc.desc}</p>
              <button
                type="button"
                className="location-card__btn"
                onClick={loc.action}
              >
                {loc.actionText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
