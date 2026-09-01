import DoctorLayout from "../../layouts/DoctorLayout";
import "./DoctorAnalytics.css";

export default function DoctorAnalytics() {
    const stats = [
        {
            label: "Total Patients",
            value: "24",
            icon: "fas fa-users",
            color: "primary",
            change: "+2 this month",
        },
        {
            label: "Total Appointments",
            value: "156",
            icon: "fas fa-calendar-check",
            color: "info",
            change: "+12 this month",
        },
        {
            label: "Completed",
            value: "142",
            icon: "fas fa-check-circle",
            color: "success",
            change: "91% completion rate",
        },
        {
            label: "Pending",
            value: "8",
            icon: "fas fa-clock",
            color: "warning",
            change: "Awaiting confirmation",
        },
    ];

    const weeklyData = [
        { day: "Mon", count: 5 },
        { day: "Tue", count: 8 },
        { day: "Wed", count: 6 },
        { day: "Thu", count: 9 },
        { day: "Fri", count: 7 },
        { day: "Sat", count: 4 },
        { day: "Sun", count: 2 },
    ];

    const maxCount = Math.max(...weeklyData.map((d) => d.count));

    return (
        <DoctorLayout>
            <div className="doctor-analytics">
                <h2 className="doctor-analytics__title">
                    <i className="fas fa-chart-bar me-2" />
                    Analytics & Reports
                </h2>

                {/* Statistics Cards */}
                <div className="row g-3 mb-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="col-md-6 col-lg-3">
                            <div className={`card border-0 h-100 analytics-card analytics-card--${stat.color}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="analytics-card__label">{stat.label}</p>
                                            <h3 className="analytics-card__value">{stat.value}</h3>
                                            <small className="analytics-card__change">{stat.change}</small>
                                        </div>
                                        <div className={`analytics-card__icon analytics-card__icon--${stat.color}`}>
                                            <i className={stat.icon} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Weekly Chart */}
                <div className="row g-3">
                    <div className="col-lg-8">
                        <div className="card border-0">
                            <div className="card-header bg-transparent border-bottom py-3">
                                <h5 className="mb-0">Weekly Appointments</h5>
                            </div>
                            <div className="card-body">
                                <div className="analytics-chart">
                                    {weeklyData.map((data) => (
                                        <div key={data.day} className="analytics-chart__item">
                                            <div className="analytics-chart__bar">
                                                <div
                                                    className="analytics-chart__fill"
                                                    style={{
                                                        height: `${(data.count / maxCount) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="analytics-chart__label">{data.day}</div>
                                            <div className="analytics-chart__value">{data.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Status */}
                    <div className="col-lg-4">
                        <div className="card border-0">
                            <div className="card-header bg-transparent border-bottom py-3">
                                <h5 className="mb-0">Status Distribution</h5>
                            </div>
                            <div className="card-body">
                                <div className="analytics-status">
                                    <div className="analytics-status__item">
                                        <div className="analytics-status__color" style={{ background: "#22c55e" }} />
                                        <span>Completed</span>
                                        <strong>142</strong>
                                    </div>
                                    <div className="analytics-status__item">
                                        <div className="analytics-status__color" style={{ background: "#0ea5e9" }} />
                                        <span>Confirmed</span>
                                        <strong>8</strong>
                                    </div>
                                    <div className="analytics-status__item">
                                        <div className="analytics-status__color" style={{ background: "#f59e0b" }} />
                                        <span>Pending</span>
                                        <strong>5</strong>
                                    </div>
                                    <div className="analytics-status__item">
                                        <div className="analytics-status__color" style={{ background: "#ef4444" }} />
                                        <span>Rejected</span>
                                        <strong>1</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
