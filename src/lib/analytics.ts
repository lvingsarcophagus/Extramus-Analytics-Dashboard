import { Intern, Project, HousingUnit, DashboardMetrics, FilterOptions } from '@/types';
import { sampleInterns, sampleProjects, sampleHousingUnits } from './data/sample-data';

// Helper function to validate dates
function isValidDate(date: Date | string | undefined | null): boolean {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function calculateDashboardMetrics(
  interns: Intern[] = sampleInterns,
  projects: Project[] = sampleProjects,
  housingUnits: HousingUnit[] = sampleHousingUnits,
  filters?: FilterOptions
): DashboardMetrics {
  // Validate input data
  if (!Array.isArray(interns) || !Array.isArray(projects) || !Array.isArray(housingUnits)) {
    console.warn('Invalid input data provided to calculateDashboardMetrics');
    return {
      totalInterns: 0,
      activeInterns: 0,
      completedProjects: 0,
      housingOccupancy: 0,
      departmentBreakdown: {},
      seasonalTrends: [],
      nationalityDistribution: {},
      genderDistribution: {}
    };
  }

  // Apply filters if provided with validation
  const filteredInterns = interns.filter(intern => {
    if (!intern || typeof intern !== 'object') return false;

    // Validate required fields
    if (!intern.department || !intern.season || typeof intern.year !== 'number') {
      return false;
    }

    const matchesDepartment = !filters?.departments?.length || filters.departments.includes(intern.department);
    const matchesSeason = !filters?.seasons?.length || filters.seasons.includes(intern.season);
    const matchesYear = !filters?.years?.length || filters.years.includes(intern.year);

    // Validate dates
    const internStartDate = intern.startDate instanceof Date ? intern.startDate : new Date(intern.startDate || '');
    const filterStartDate = filters?.timeRange?.start instanceof Date ? filters.timeRange.start : new Date(filters?.timeRange?.start || '');
    const filterEndDate = filters?.timeRange?.end instanceof Date ? filters.timeRange.end : new Date(filters?.timeRange?.end || '');

    const matchesTimeRange = !filters?.timeRange ||
      (isValidDate(internStartDate) && isValidDate(filterStartDate) && isValidDate(filterEndDate) &&
       internStartDate >= filterStartDate && internStartDate <= filterEndDate);

    return matchesDepartment && matchesSeason && matchesYear && matchesTimeRange;
  });

  const filteredProjects = projects.filter(project => {
    if (!project || typeof project !== 'object') return false;

    // Validate required fields
    if (!project.status || !project.startDate) {
      return false;
    }

    const projectStartDate = project.startDate instanceof Date ? project.startDate : new Date(project.startDate || '');
    const filterStartDate = filters?.timeRange?.start instanceof Date ? filters.timeRange.start : new Date(filters?.timeRange?.start || '');
    const filterEndDate = filters?.timeRange?.end instanceof Date ? filters.timeRange.end : new Date(filters?.timeRange?.end || '');

    const matchesTimeRange = !filters?.timeRange ||
      (isValidDate(projectStartDate) && isValidDate(filterStartDate) && isValidDate(filterEndDate) &&
       projectStartDate >= filterStartDate && projectStartDate <= filterEndDate);

    return matchesTimeRange;
  });

  const totalInterns = filteredInterns.length;
  const activeInterns = filteredInterns.filter(intern =>
    intern?.status?.toLowerCase() === 'active'
  ).length;
  const completedProjects = filteredProjects.filter(project =>
    project?.status?.toLowerCase() === 'completed'
  ).length;

  // Housing calculations with validation
  const validHousingUnits = housingUnits.filter(unit =>
    unit && typeof unit === 'object' &&
    typeof unit.capacity === 'number' && unit.capacity >= 0 &&
    typeof unit.currentOccupancy === 'number' && unit.currentOccupancy >= 0
  );

  const totalHousingCapacity = validHousingUnits.reduce((sum, unit) => sum + (unit.capacity || 0), 0);
  const totalOccupancy = validHousingUnits.reduce((sum, unit) => sum + (unit.currentOccupancy || 0), 0);
  const housingOccupancy = totalHousingCapacity > 0 ? Math.round((totalOccupancy / totalHousingCapacity) * 100) : 0;

  // Department breakdown with validation
  const departmentBreakdown = filteredInterns.reduce((acc, intern) => {
    if (intern?.department && typeof intern.department === 'string') {
      const dept = intern.department.trim();
      if (dept) {
        acc[dept] = (acc[dept] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  // Seasonal trends with validation
  const seasonalTrends = generateSeasonalTrends(filteredInterns, filteredProjects);

  // Nationality distribution with validation
  const nationalityDistribution = filteredInterns.reduce((acc, intern) => {
    if (intern?.nationality && typeof intern.nationality === 'string') {
      const nationality = intern.nationality.trim();
      if (nationality) {
        acc[nationality] = (acc[nationality] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  // Gender distribution with validation
  const genderDistribution = filteredInterns.reduce((acc, intern) => {
    if (intern?.gender && typeof intern.gender === 'string') {
      const gender = intern.gender.trim().toLowerCase();
      if (gender && ['male', 'female', 'other', 'prefer_not_to_say'].includes(gender)) {
        acc[gender] = (acc[gender] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalInterns,
    activeInterns,
    completedProjects,
    housingOccupancy,
    departmentBreakdown,
    seasonalTrends,
    nationalityDistribution,
    genderDistribution
  };
}

function generateSeasonalTrends(interns: Intern[], projects: Project[]) {
  const trends: Array<{ period: string; interns: number; projects: number }> = [];

  // Group by year and season with validation
  const periods = new Map<string, { interns: number; projects: number }>();

  // Process interns with validation
  interns.forEach(intern => {
    if (!intern?.year || !intern?.season || !intern?.startDate) return;

    const year = typeof intern.year === 'number' ? intern.year : parseInt(String(intern.year));
    if (isNaN(year) || year < 2000 || year > 2100) return;

    const season = intern.season.toLowerCase();
    if (!['summer', 'winter', 'spring', 'fall'].includes(season)) return;

    const key = `${year}-${season}`;
    if (!periods.has(key)) {
      periods.set(key, { interns: 0, projects: 0 });
    }
    periods.get(key)!.interns++;
  });

  // Process projects with validation
  projects.forEach(project => {
    if (!project?.startDate) return;

    const startDate = project.startDate instanceof Date ? project.startDate : new Date(project.startDate);
    if (!isValidDate(startDate)) return;

    const year = startDate.getFullYear();
    if (year < 2000 || year > 2100) return;

    const month = startDate.getMonth();
    let season = 'spring';
    if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else if (month >= 11 || month <= 1) season = 'winter';

    const key = `${year}-${season}`;
    if (!periods.has(key)) {
      periods.set(key, { interns: 0, projects: 0 });
    }
    periods.get(key)!.projects++;
  });

  // Convert to array and sort with validation
  Array.from(periods.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([period, data]) => {
      if (data.interns > 0 || data.projects > 0) {
        trends.push({
          period: period.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          ...data
        });
      }
    });

  return trends;
}

export function getAvailableFilters(interns: Intern[] = sampleInterns) {
  if (!Array.isArray(interns)) {
    console.warn('Invalid interns data provided to getAvailableFilters');
    return { departments: [], seasons: [], years: [] };
  }

  const departments = [...new Set(
    interns
      .filter(intern => intern?.department && typeof intern.department === 'string')
      .map(intern => intern.department.trim())
      .filter(dept => dept.length > 0)
  )].sort();

  const seasons = [...new Set(
    interns
      .filter(intern => intern?.season && typeof intern.season === 'string')
      .map(intern => intern.season.trim().toLowerCase())
      .filter(season => ['summer', 'winter', 'spring', 'fall'].includes(season))
  )].sort();

  const years = [...new Set(
    interns
      .filter(intern => intern?.year && (typeof intern.year === 'number' || typeof intern.year === 'string'))
      .map(intern => {
        const year = typeof intern.year === 'number' ? intern.year : parseInt(String(intern.year));
        return !isNaN(year) && year >= 2000 && year <= 2100 ? year : null;
      })
      .filter((year): year is number => year !== null)
  )].sort((a, b) => b - a);

  return { departments, seasons, years };
}

export function generateTimeRangeOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return {
    thisMonth: {
      start: new Date(currentYear, now.getMonth(), 1),
      end: new Date(currentYear, now.getMonth() + 1, 0),
      period: 'month' as const
    },
    thisYear: {
      start: new Date(currentYear, 0, 1),
      end: new Date(currentYear, 11, 31),
      period: 'year' as const
    },
    lastYear: {
      start: new Date(currentYear - 1, 0, 1),
      end: new Date(currentYear - 1, 11, 31),
      period: 'year' as const
    },
    last12Months: {
      start: new Date(currentYear - 1, now.getMonth(), 1),
      end: now,
      period: 'year' as const
    }
  };
}
