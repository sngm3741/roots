import { Col } from "~/components/atoms/Col";
import { Grid12 } from "~/components/atoms/Grid12";

type EventCardProps = {
  title: string;
  dates: string[];
  reservationRequired?: boolean;
  linkUrl?: string;
};

export function EventCard({
  title,
  dates,
  reservationRequired,
  linkUrl,
}: EventCardProps) {
  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noreferrer"
        className="block w-full border-b border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50"
      >
        <EventCardContent
          title={title}
          dates={dates}
          reservationRequired={reservationRequired}
        />
      </a>
    );
  }

  return (
    <div className="w-full border-b border-slate-100 px-4 py-4">
      <EventCardContent
        title={title}
        dates={dates}
        reservationRequired={reservationRequired}
      />
    </div>
  );
}

type EventCardContentProps = {
  title: string;
  dates: string[];
  reservationRequired?: boolean;
};

function EventCardContent({
  title,
  dates,
  reservationRequired,
}: EventCardContentProps) {
  return (
    <Grid12 gap="2" className="items-start">
      <Col span={12}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">
            ❤️ {title}
          </h3>
          {reservationRequired ? (
            <span className="inline-flex shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              完全予約制
            </span>
          ) : null}
        </div>
      </Col>
      <Col span={12}>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {dates.map((date) => {
            const dayOnly = date.split(" ")[0];
            return (
              <span
                key={`${title}-${date}`}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
              >
                {dayOnly}
              </span>
            );
          })}
        </div>
      </Col>
    </Grid12>
  );
}
