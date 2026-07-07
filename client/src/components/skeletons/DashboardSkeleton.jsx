function DashboardSkeleton() {
    return (
        <>
            <div className="overview-header">
                <div className="skeleton skeleton-label"></div>
                <div className="skeleton skeleton-btn"></div>
            </div>

            <div className="overview-grid">
                {[1, 2, 3, 4].map((item) => (
                    <div className="overview-card" key={item}>
                        <div className="skeleton skeleton-icon"></div>
                        <div className="skeleton-content">
                            <div className="skeleton skeleton-text short"></div>
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-text tiny"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="panel">
                    <div className="skeleton skeleton-heading"></div>
                    <div className="skeleton skeleton-chart"></div>
                </div>

                <div className="panel">
                    <div className="skeleton skeleton-heading"></div>
                    <div className="skeleton skeleton-chart"></div>
                </div>
            </div>

            <div className="dashboard-grid second-grid">
                <div className="panel">
                    {[1, 2, 3].map((item) => (
                        <div className="skeleton-transaction" key={item}>
                            <div className="skeleton skeleton-icon"></div>
                            <div className="skeleton-content">
                                <div className="skeleton skeleton-text"></div>
                                <div className="skeleton skeleton-text short"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="panel">
                    {[1, 2, 3].map((item) => (
                        <div className="skeleton skeleton-insight" key={item}></div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default DashboardSkeleton;