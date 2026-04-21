import React from 'react';
import './page-skeletons.css';

type SkeletonLineProps = {
  width?: string;
  height?: string;
  className?: string;
};

function SkeletonLine({ width = '100%', height = '14px', className = '' }: SkeletonLineProps) {
  return (
    <span
      className={`skeleton-block ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

function DashboardTopBarSkeleton({ showSearch = false, showButton = false }: { showSearch?: boolean; showButton?: boolean }) {
  return (
    <header className="skeleton-topbar">
      <div className="skeleton-topbar__left">
        <div className="skeleton-nav-pills">
          <SkeletonLine width="32px" height="32px" className="skeleton-block--rounded-md" />
          <SkeletonLine width="32px" height="32px" className="skeleton-block--rounded-md" />
        </div>
        <SkeletonLine width="180px" height="16px" />
      </div>

      <div className="skeleton-topbar__right">
        {showSearch ? <SkeletonLine width="240px" height="38px" className="skeleton-block--rounded-md" /> : null}
        {showButton ? <SkeletonLine width="144px" height="38px" className="skeleton-block--rounded-md" /> : null}
        <SkeletonLine width="34px" height="34px" className="skeleton-block--circle" />
      </div>
    </header>
  );
}

function TableRowSkeleton({ columns }: { columns: string[] }) {
  return (
    <article className="skeleton-table-row" style={{ gridTemplateColumns: columns.join(' ') }}>
      {columns.map((_, index) => (
        <SkeletonLine
          key={index}
          width={index === columns.length - 1 ? '72px' : index === 0 ? '80%' : '65%'}
          height="14px"
          className={index === columns.length - 1 ? 'skeleton-block--rounded-md' : ''}
        />
      ))}
    </article>
  );
}

function MetricCardSkeleton() {
  return (
    <article className="skeleton-surface skeleton-metric-card">
      <SkeletonLine width="58%" height="28px" />
      <SkeletonLine width="46%" height="13px" />
    </article>
  );
}

function SidebarLayoutSkeleton() {
  return (
    <div className="skeleton-detail-grid">
      <aside className="skeleton-sidebar-column">
        <div className="skeleton-surface skeleton-card-stack">
          <SkeletonLine width="42%" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="88%" />
          <SkeletonLine width="76%" />
        </div>
        <div className="skeleton-surface skeleton-card-stack">
          <SkeletonLine width="38%" />
          <div className="skeleton-chip-row">
            <SkeletonLine width="84px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="92px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="70px" height="30px" className="skeleton-block--pill" />
          </div>
          <SkeletonLine width="64%" />
        </div>
      </aside>

      <section className="skeleton-surface skeleton-main-panel">
        <div className="skeleton-panel-header">
          <div className="skeleton-stack">
            <SkeletonLine width="110px" height="12px" />
            <SkeletonLine width="220px" height="22px" />
          </div>
          <SkeletonLine width="108px" height="36px" className="skeleton-block--rounded-md" />
        </div>

        <div className="skeleton-stack">
          <SkeletonLine width="100%" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="92%" />
          <SkeletonLine width="95%" />
          <SkeletonLine width="86%" />
        </div>
      </section>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="page-container">
      <DashboardTopBarSkeleton showSearch showButton />

      <section className="skeleton-overview-panel">
        <div className="skeleton-overview-toolbar">
          <SkeletonLine width="108px" height="22px" />
          <div className="skeleton-overview-controls skeleton-surface skeleton-surface--tight">
            <SkeletonLine width="100%" height="38px" className="skeleton-block--rounded-md" />
            <div className="skeleton-chip-row">
              <SkeletonLine width="56px" height="34px" className="skeleton-block--pill" />
              <SkeletonLine width="72px" height="34px" className="skeleton-block--pill" />
              <SkeletonLine width="84px" height="34px" className="skeleton-block--pill" />
            </div>
          </div>
        </div>

        <div className="skeleton-surface skeleton-table-shell">
          <div className="skeleton-table-head">
            <SkeletonLine width="90px" />
            <SkeletonLine width="60px" />
            <SkeletonLine width="74px" />
            <SkeletonLine width="78px" />
            <SkeletonLine width="88px" />
            <SkeletonLine width="54px" />
          </div>
          <div className="skeleton-stack">
            {Array.from({ length: 5 }, (_, index) => (
              <TableRowSkeleton key={index} columns={['1.5fr', '1fr', '0.8fr', '1.2fr', '1fr', '0.9fr']} />
            ))}
          </div>
        </div>
      </section>

      <div className="skeleton-two-column">
        <div className="skeleton-surface skeleton-chart-card">
          <SkeletonLine width="120px" height="20px" />
          <SkeletonLine width="100%" height="240px" className="skeleton-block--rounded-lg" />
        </div>
        <div className="skeleton-surface skeleton-chart-card">
          <SkeletonLine width="144px" height="20px" />
          <SkeletonLine width="100%" height="240px" className="skeleton-block--rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function JobsPageSkeleton() {
  return (
    <div className="page-container">
      <DashboardTopBarSkeleton />
      <section className="skeleton-stack">
        <div className="skeleton-page-toolbar">
          <SkeletonLine width="160px" height="28px" />
          <div className="skeleton-toolbar-actions">
            <SkeletonLine width="132px" height="38px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="132px" height="38px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="152px" height="38px" className="skeleton-block--rounded-md" />
          </div>
        </div>

        <div className="skeleton-card-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <article key={index} className="skeleton-surface skeleton-job-card">
              <div className="skeleton-space-between">
                <div className="skeleton-stack">
                  <SkeletonLine width="72%" height="18px" />
                  <SkeletonLine width="48%" height="18px" />
                </div>
                <SkeletonLine width="68px" height="28px" className="skeleton-block--pill" />
              </div>
              <SkeletonLine width="88%" />
              <SkeletonLine width="64%" />
              <div className="skeleton-space-between">
                <SkeletonLine width="104px" height="28px" className="skeleton-block--pill" />
                <SkeletonLine width="112px" />
              </div>
              <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />
              <SkeletonLine width="86px" height="34px" className="skeleton-block--rounded-md" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CandidatesPageSkeleton() {
  return (
    <div className="page-container">
      <DashboardTopBarSkeleton />
      <div className="skeleton-page-toolbar">
        <SkeletonLine width="140px" height="28px" />
        <SkeletonLine width="112px" height="38px" className="skeleton-block--rounded-md" />
      </div>

      <div className="skeleton-surface skeleton-table-shell">
        <div className="skeleton-table-head">
          <SkeletonLine width="70px" />
          <SkeletonLine width="86px" />
          <SkeletonLine width="74px" />
          <SkeletonLine width="58px" />
          <SkeletonLine width="34px" />
        </div>
        <div className="skeleton-stack">
          {Array.from({ length: 6 }, (_, index) => (
            <TableRowSkeleton key={index} columns={['1.2fr', '1.6fr', '1fr', '0.8fr', '0.8fr']} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScreeningsPageSkeleton() {
  return (
    <div className="page-container screenings-page">
      <DashboardTopBarSkeleton />

      <div className="skeleton-metrics-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      <section className="skeleton-surface skeleton-screenings-shell">
        <div className="skeleton-page-toolbar">
          <SkeletonLine width="126px" height="28px" />
          <div className="skeleton-toolbar-actions skeleton-toolbar-actions--wide">
            <SkeletonLine width="240px" height="38px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="160px" height="38px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="160px" height="38px" className="skeleton-block--rounded-md" />
          </div>
        </div>

        <div className="skeleton-table-head">
          <SkeletonLine width="84px" />
          <SkeletonLine width="60px" />
          <SkeletonLine width="66px" />
          <SkeletonLine width="70px" />
          <SkeletonLine width="64px" />
          <SkeletonLine width="52px" />
          <SkeletonLine width="56px" />
        </div>

        <div className="skeleton-stack">
          {Array.from({ length: 5 }, (_, index) => (
            <TableRowSkeleton key={index} columns={['1.5fr', '0.9fr', '0.8fr', '0.9fr', '0.8fr', '0.9fr', '0.9fr']} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CreateJobPageSkeleton() {
  return (
    <div className="page-container flex-col skeleton-center-shell">
      <div className="skeleton-surface skeleton-form-card">
        <div className="skeleton-stack skeleton-stack--center">
          <SkeletonLine width="132px" height="26px" />
          <SkeletonLine width="180px" />
        </div>

        <div className="skeleton-form-section">
          <SkeletonLine width="64px" height="18px" />
          <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
          <div className="skeleton-chip-row">
            <SkeletonLine width="88px" height="38px" className="skeleton-block--pill" />
            <SkeletonLine width="88px" height="38px" className="skeleton-block--pill" />
            <SkeletonLine width="88px" height="38px" className="skeleton-block--pill" />
            <SkeletonLine width="88px" height="38px" className="skeleton-block--pill" />
          </div>
          <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
        </div>

        <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

        <div className="skeleton-form-section">
          <SkeletonLine width="120px" height="18px" />
          <div className="skeleton-chip-row">
            <SkeletonLine width="90px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="106px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="80px" height="30px" className="skeleton-block--pill" />
          </div>
          <div className="skeleton-two-column">
            <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
          </div>
        </div>

        <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

        <div className="skeleton-form-section">
          <SkeletonLine width="96px" height="18px" />
          <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
          <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
          <SkeletonLine width="148px" height="38px" className="skeleton-block--rounded-md" />
        </div>

        <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

        <div className="skeleton-form-section">
          <SkeletonLine width="126px" height="18px" />
          <SkeletonLine width="100%" height="160px" className="skeleton-block--rounded-lg" />
        </div>

        <div className="skeleton-toolbar-actions">
          <SkeletonLine width="126px" height="40px" className="skeleton-block--rounded-md" />
          <SkeletonLine width="146px" height="40px" className="skeleton-block--rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ApplicantsPageSkeleton() {
  return (
    <div className="page-container applicants-page">
      <DashboardTopBarSkeleton />
      <div className="skeleton-detail-grid">
        <section className="skeleton-stack">
          <div className="skeleton-page-toolbar">
            <SkeletonLine width="168px" height="28px" />
            <div className="skeleton-toolbar-actions">
              <SkeletonLine width="180px" height="38px" className="skeleton-block--rounded-md" />
              <SkeletonLine width="120px" height="38px" className="skeleton-block--rounded-md" />
              <SkeletonLine width="112px" height="38px" className="skeleton-block--rounded-md" />
            </div>
          </div>

          <div className="skeleton-surface skeleton-table-shell">
            <div className="skeleton-table-head">
              <SkeletonLine width="24px" />
              <SkeletonLine width="64px" />
              <SkeletonLine width="86px" />
              <SkeletonLine width="70px" />
            </div>
            <div className="skeleton-stack">
              {Array.from({ length: 6 }, (_, index) => (
                <TableRowSkeleton key={index} columns={['0.2fr', '1.2fr', '1fr', '1fr']} />
              ))}
            </div>
          </div>

          <SkeletonLine width="164px" height="42px" className="skeleton-block--rounded-md" />
        </section>

        <aside className="skeleton-surface skeleton-card-stack">
          <SkeletonLine width="54%" height="18px" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton-surface skeleton-inner-card">
              <div className="skeleton-space-between">
                <SkeletonLine width="84px" />
                <SkeletonLine width="62px" height="28px" className="skeleton-block--pill" />
              </div>
              <SkeletonLine width="92%" />
              <SkeletonLine width="74%" />
              <SkeletonLine width="96px" height="34px" className="skeleton-block--rounded-md" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function DraftPageSkeleton() {
  return (
    <div className="page-container draft-page">
      <DashboardTopBarSkeleton />
      <section className="skeleton-stack">
        <div className="skeleton-surface skeleton-hero">
          <div className="skeleton-stack">
            <SkeletonLine width="92px" height="12px" />
            <SkeletonLine width="320px" height="32px" />
            <SkeletonLine width="88%" />
            <SkeletonLine width="74%" />
          </div>
          <div className="skeleton-toolbar-actions">
            <SkeletonLine width="112px" height="40px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="124px" height="40px" className="skeleton-block--rounded-md" />
          </div>
        </div>

        <SidebarLayoutSkeleton />
      </section>
    </div>
  );
}

export function SessionResultsPageSkeleton() {
  return (
    <div className="page-container screening-session-page">
      <DashboardTopBarSkeleton />
      <div className="skeleton-stack">
        <SkeletonLine width="320px" height="30px" />
        <SkeletonLine width="68%" />
      </div>

      <div className="skeleton-detail-grid">
        <aside className="skeleton-surface skeleton-card-stack">
          <SkeletonLine width="58%" height="18px" />
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton-space-between skeleton-list-row">
              <SkeletonLine width="12px" />
              <SkeletonLine width="100%" />
              <SkeletonLine width="48px" />
            </div>
          ))}
          <SkeletonLine width="96px" height="36px" className="skeleton-block--rounded-md" />
        </aside>

        <section className="skeleton-surface skeleton-main-panel">
          <div className="skeleton-space-between">
            <div className="skeleton-identity">
              <SkeletonLine width="64px" height="64px" className="skeleton-block--circle" />
              <div className="skeleton-stack">
                <SkeletonLine width="180px" height="22px" />
                <SkeletonLine width="140px" />
                <SkeletonLine width="120px" />
              </div>
            </div>
            <SkeletonLine width="110px" height="110px" className="skeleton-block--circle" />
          </div>

          <div className="skeleton-chip-row">
            <SkeletonLine width="88px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="96px" height="30px" className="skeleton-block--pill" />
            <SkeletonLine width="80px" height="30px" className="skeleton-block--pill" />
          </div>

          <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

          <div className="skeleton-stack">
            <SkeletonLine width="96px" height="18px" />
            <SkeletonLine width="100%" height="140px" className="skeleton-block--rounded-lg" />
          </div>

          <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

          <div className="skeleton-stack">
            <SkeletonLine width="126px" height="18px" />
            <SkeletonLine width="180px" height="36px" className="skeleton-block--rounded-md" />
          </div>

          <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />

          <div className="skeleton-stack">
            <SkeletonLine width="112px" height="18px" />
            <SkeletonLine width="100%" height="120px" className="skeleton-block--rounded-lg" />
            <SkeletonLine width="180px" height="36px" className="skeleton-block--rounded-md" />
          </div>
        </section>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="page-container">
      <DashboardTopBarSkeleton />
      <div className="skeleton-surface skeleton-settings-card">
        <SkeletonLine width="120px" height="24px" />
        <SkeletonLine width="52%" />
        <SkeletonLine width="44%" />
      </div>
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="login-container skeleton-login-shell">
      <div className="login-card skeleton-surface skeleton-login-card">
        <div className="login-card-content skeleton-stack">
          <div className="skeleton-stack skeleton-stack--center">
            <SkeletonLine width="160px" height="28px" />
            <SkeletonLine width="190px" />
          </div>

          <div className="skeleton-stack">
            <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="100%" height="46px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="118px" />
            <SkeletonLine width="100%" height="44px" className="skeleton-block--rounded-md" />
            <SkeletonLine width="100%" height="1px" className="skeleton-block--divider" />
            <SkeletonLine width="100%" height="44px" className="skeleton-block--rounded-md" />
          </div>
        </div>
      </div>

      <div className="login-branding skeleton-login-branding">
        <div className="brand-shell skeleton-stack skeleton-stack--center">
          <SkeletonLine width="60px" height="60px" className="skeleton-block--circle" />
          <SkeletonLine width="96px" height="28px" />
        </div>
      </div>
    </div>
  );
}
