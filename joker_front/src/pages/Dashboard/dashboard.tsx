import { useState, useEffect } from "react";
import HttpClient from "../../utils/HttpClient";
import Sidebar from "../../components/sideBar/sideBar";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loader from "../../components/loaders/Loader";
import { toast } from "react-hot-toast";
import { FaCalendar, FaChartLine, FaBoxOpen, FaFilter } from "react-icons/fa";

// Define interface for the statistics data
interface Statistics {
  total_requests: number;
  unseen_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  finished_requests: number;
  delivered_requests: number;
  repetitions_count: number;
  conversion_rate: number;
  total_revenue: number;
  top_article: string;
  top_color: string;
}

// Define interface for the StatisticCard props
interface StatisticCardProps {
  title: string;
  value: string | number;
  progress: number;
  color: string;
  icon?: React.ReactNode;
}

// Define interface for the date range
interface DateRange {
  startDate: string;
  endDate: string;
}

const Dashboard: React.FC = () => {
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });
  const [userInitiated, setUserInitiated] = useState<boolean>(false);

  // Define fetchStatistics outside useEffect
  const fetchStatistics = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      // Create proper query parameters
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("start_date", dateRange.startDate);
      if (dateRange.endDate) params.append("end_date", dateRange.endDate);

      // Use the correct endpoint
      const response = await HttpClient.get(
        "statistics/calculate/?" + params.toString()
      );

      // Make sure we have valid statistics data
      if (response && typeof response === "object") {
        setStatistics(response as Statistics);

        // Only show toast if user initiated the change
        if (userInitiated) {
          toast.success("Statistics loaded successfully");
          setUserInitiated(false);
        }
      } else {
        throw new Error("Invalid statistics data");
      }
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics. Please try again later.");

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }

      if (userInitiated) {
        toast.error("Failed to load statistics");
        setUserInitiated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const handleDateChange = (): void => {
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
      toast.error("Start date cannot be after end date");
      return;
    }
    setError("");
    setUserInitiated(true);
    setDateRange({ startDate, endDate });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">
          Dashboard Overview
        </h2>

        {/* Date Filter Panel */}
        <div className="mb-8 rounded-lg bg-white p-5 shadow-md">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-700">
            <FaCalendar className="text-blue-500" />
            <span>Select Date Range</span>
          </h3>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm transition-all focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-sm font-medium text-gray-600">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm transition-all focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <button
              onClick={handleDateChange}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 sm:w-auto"
            >
              <FaFilter size={14} />
              <span>Apply Filter</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader
              backgroundColor="transparent"
              color="#3b82f6"
              className="h-12 w-12"
            />
          </div>
        ) : statistics ? (
          <>
            {/* Order Statistics Section */}
            <div className="mb-8">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-700">
                <FaChartLine className="text-blue-500" />
                <span>Order Statistics</span>
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                <StatisticCard
                  title="Total Orders"
                  value={statistics.total_requests}
                  progress={100}
                  color="#3b82f6"
                />
                <StatisticCard
                  title="Unseen Orders"
                  value={statistics.unseen_requests}
                  progress={
                    statistics.total_requests > 0
                      ? (statistics.unseen_requests /
                          statistics.total_requests) *
                        100
                      : 0
                  }
                  color="#ef4444"
                />
                <StatisticCard
                  title="Conversion Rate"
                  value={`${statistics.conversion_rate.toFixed(2)}%`}
                  progress={Math.min(statistics.conversion_rate, 100)}
                  color="#10b981"
                />
                <StatisticCard
                  title="Total Revenue"
                  value={`${statistics.total_revenue.toLocaleString()} DA`}
                  progress={Math.min(
                    (statistics.total_revenue / 100000) * 100,
                    100
                  )}
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Order Status Section */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-700">
                <FaBoxOpen className="text-blue-500" />
                <span>Order Status</span>
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                <StatisticCard
                  title="In Progress"
                  value={statistics.in_progress_requests}
                  progress={
                    statistics.total_requests > 0
                      ? (statistics.in_progress_requests /
                          statistics.total_requests) *
                        100
                      : 0
                  }
                  color="#8b5cf6"
                />
                <StatisticCard
                  title="Finished Orders"
                  value={statistics.finished_requests}
                  progress={
                    statistics.total_requests > 0
                      ? (statistics.finished_requests /
                          statistics.total_requests) *
                        100
                      : 0
                  }
                  color="#6366f1"
                />
                <StatisticCard
                  title="Delivered Orders"
                  value={statistics.delivered_requests}
                  progress={
                    statistics.total_requests > 0
                      ? (statistics.delivered_requests /
                          statistics.total_requests) *
                        100
                      : 0
                  }
                  color="#34d399"
                />
                <StatisticCard
                  title="Repetitions"
                  value={statistics.repetitions_count}
                  progress={Math.min(
                    (statistics.repetitions_count / 100) * 100,
                    100
                  )}
                  color="#ec4899"
                />
              </div>
            </div>

            {/* Additional analytics could be added here */}
            <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-medium text-gray-700">
                Revenue Insights
              </h3>
              <p className="text-gray-600">
                Average revenue per order:
                <span className="ml-2 font-semibold">
                  {statistics.total_requests > 0
                    ? `${(statistics.total_revenue / statistics.total_requests).toFixed(2)} DA`
                    : "N/A"}
                </span>
              </p>
              <p className="mt-2 text-gray-600">
                Delivery rate:
                <span className="ml-2 font-semibold">
                  {statistics.total_requests > 0
                    ? `${((statistics.delivered_requests / statistics.total_requests) * 100).toFixed(2)}%`
                    : "N/A"}
                </span>
              </p>
              {statistics.top_article && (
                <p className="mt-2 text-gray-600">
                  Top article:
                  <span className="ml-2 font-semibold">
                    {statistics.top_article}
                  </span>
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <div className="mb-4 flex justify-center">
              <FaChartLine className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-gray-600">
              No statistics available for the selected date range.
            </p>
            <button
              onClick={() => {
                setUserInitiated(true);
                setDateRange({
                  startDate: getTodayDate(),
                  endDate: getTodayDate(),
                });
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              View Today's Statistics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  progress,
  color,
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(
    Math.max(isNaN(progress) ? 0 : progress, 0),
    100
  );

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-5 shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className="mb-4 h-20 w-20">
        <CircularProgressbar
          value={safeProgress}
          text={
            typeof value === "number" && value > 999
              ? `${(value / 1000).toFixed(1)}k`
              : value.toString()
          }
          styles={buildStyles({
            textSize: "24px",
            textColor: color,
            pathColor: color,
            trailColor: "#e5e7eb",
            pathTransition: "stroke-dashoffset 0.5s ease 0s",
          })}
        />
      </div>
      <h3 className="text-center text-lg font-medium text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {typeof value === "number" ? safeProgress.toFixed(0) + "%" : ""}
      </p>
    </div>
  );
};

export default Dashboard;
