// Import ECharts from CDN dynamically
async function loadECharts() {
  if (typeof echarts === 'undefined') {
    await import('https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js');
  }
}

export function generateRandomData(startYear, endYear, min = 1, max = 10) {
  const data = [];
  for (let year = startYear; year <= endYear; year++) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    data.push({ year, value });
  }
  return data;
}

export function generateGrowingData(startYear, endYear, startValue = 4, maxStep = 2) {
  const data = [];
  let currentValue = startValue;

  for (let year = startYear; year <= endYear; year++) {
    currentValue += Math.floor(Math.random() * maxStep) + 1;
    data.push({ year, value: currentValue });
  }

  return data;
}

export function generateYears(start, end) {
  const years = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  return years;
}

const growingData = generateGrowingData(2009, 2025);
const randomData = generateRandomData(2009, 2025);
const data = generateYears('2009', '2025');

const mainColorCharts = '#9d73ff';

function createPattern(color = mainColorCharts) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const symbols = ['#', '@', '%', '=', '+', '*', '-', ':', '.', ' '];
  const step = 14;
  canvas.width = 70;
  canvas.height = 70;
  ctx.fillStyle = color;
  ctx.font = `${step}px monospace`;

  for (let i = 0; i < canvas.height / step; i++) {
    for (let j = 0; j < canvas.width / step; j++) {
      const char = symbols[Math.floor(Math.random() * symbols.length)];
      ctx.fillText(char, j * step, i * step + step);
    }
  }

  return {
    image: canvas,
    repeat: 'repeat',
  };
}

const grid = {
  left: '10px',
  right: '10px',
  bottom: '90px',
  containLabel: true,
};

const titleStyle = {
  fontSize: 30,
  fontWeight: 400,
  fontFamily: '"Consola", "Courier New", Courier, monospace',
  color: 'white',
};

const tooltip = {
  renderMode: 'html',
  className: 'echarts-tooltip',
};

export async function initCharts() {
  await loadECharts();

  const allCoursesChart = echarts.init(document.getElementById('allCoursesChart'));
  const allCoursesOptions = {
    title: {
      text: 'All Courses',
      itemStyle: {
        color: 'white',
      },
      top: 0,
      textStyle: titleStyle,
      padding: [0, 0, 0, 0],
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      ...tooltip,
    },
    legend: {
      show: false,
    },
    grid,
    series: [
      {
        name: 'Courses',
        type: 'pie',
        radius: ['30%', '90%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
          textShadowColor: 'black',
          textShadowBlur: 12,
          textShadowOffsetX: -6,
          textShadowOffsetY: -6,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold',
          },
          itemStyle: {
            color: mainColorCharts,
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: 10,
            name: 'In progress',
            label: {
              color: '#fff',
            },
          },
          {
            value: 54,
            name: 'Completed',
            url: '#course-1',
            label: {
              name: 'Completed',
              color: '#fff',
            },
            labelLine: {
              show: false,
            },
          },
        ],
        color: [createPattern(`${mainColorCharts}70`), createPattern()],
      },
    ],
  };
  allCoursesChart.setOption(allCoursesOptions);

  allCoursesChart.on('doubleclick', function (params) {
    const { url } = params.data;
    if (url) {
      window.open(url, '_self');
    }
  });

  const coursesByYearChart = echarts.init(document.getElementById('coursesByYearChart'));
  const coursesByYearOptions = {
    title: {
      text: 'Courses By Year',
      itemStyle: {
        color: 'white',
      },
      textStyle: titleStyle,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: ([params]) => {
        const { axisValueLabel, marker, value } = params;
        return `<div class="axis-value-label">${axisValueLabel}</div><div class="value-container"><span class="marker">${marker}</span> <span><strong>${value}</strong> courses</span></div>`;
      },
      ...tooltip,
    },
    legend: {},
    grid,
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        color: 'white',
      },
      data: [
        '2009',
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019',
        '2020',
        '2021',
        '2022',
        '2023',
        '2024',
        '2025',
      ],
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: [2, 5, 3, 8, 7, 6, 12, 9, 11, 10, 15, 14, 13, 16, 18, 20, 22],
        itemStyle: {
          color: createPattern(),
        },
        emphasis: {
          itemStyle: {
            color: mainColorCharts,
          },
        },
        link: {
          symbol: 'arrow',
          symbolSize: 10,
          color: '#33488490',
        },
      },
    ],
  };
  coursesByYearChart.setOption(coursesByYearOptions);

  const byAcademyLabels = {
    'LinkedIn Learning': 'LinkedIn Learning',
    Coursera: 'Coursera',
    Udacity: 'Udacity',
    Codecademy: 'Codecademy',
    Udemy: 'Udemy',
    'Globant University': 'Globant University',
    TutsPlus: 'TutsPlus',
    'Microsoft Learn': 'Microsoft Learn',
    UNSW: 'University of New South Wales',
    CTIC: 'CTIC',
  };

  const coursesByAcademyChart = echarts.init(document.getElementById('coursesByAcademyChart'));
  const coursesByAcademyOptions = {
    title: {
      text: 'Courses By Academy',
      itemStyle: {
        color: 'white',
      },
      textStyle: titleStyle,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: ([{ name, marker, value }]) => {
        let courseText = 'course';
        if (value > 1) {
          courseText = 'courses';
        }
        return `<div class="axis-value-label">${byAcademyLabels[name]}</div><div class="value-container"><span class="marker">${marker}</span> <span><strong>${value}</strong> ${courseText}</span></div>`;
      },
      ...tooltip,
    },
    legend: {},
    grid,
    xAxis: {
      type: 'category',
      axisLabel: {
        rotate: 90,
        fontSize: 14,
        color: 'white',
      },
      data: [
        'LinkedIn Learning',
        'Coursera',
        'Udacity',
        'CTIC',
        'Codecademy',
        'Udemy',
        'Globant University',
        'TutsPlus',
        'Microsoft Learn',
        'UNSW',
      ],
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        showBackground: false,
        data: [8, 12, 7, 1, 5, 6, 4, 15, 9, 11],
        itemStyle: {
          color: createPattern(),
        },
        emphasis: {
          itemStyle: {
            color: mainColorCharts,
          },
        },
        link: {
          symbol: 'arrow',
          symbolSize: 10,
          color: '#33488490',
        },
      },
    ],
  };
  coursesByAcademyChart.setOption(coursesByAcademyOptions);

  const chartByType = echarts.init(document.getElementById('chartByType'));

  const optionsByType = {
    title: {
      text: 'Courses By Type',
      itemStyle: {
        color: 'white',
      },
      textStyle: titleStyle,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#c80000',
        },
      },
      ...tooltip,
    },
    legend: {
      show: false,
    },
    toolbox: {},
    grid,
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisTick: {
          show: true,
        },
        axisLabel: {
          color: 'white',
          align: 'right',
          ellipsis: 'truncate',
        },
        data,
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: {
          show: true,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'In person',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: createPattern(mainColorCharts),
        },
        itemStyle: {
          color: mainColorCharts,
        },
        emphasis: {
          focus: 'series',
          areaStyle: {
            color: mainColorCharts,
          },
        },
        data: randomData,
      },
      {
        name: 'Online',
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: createPattern(mainColorCharts),
        },
        itemStyle: {
          color: mainColorCharts,
        },
        emphasis: {
          focus: 'series',
          areaStyle: {
            color: mainColorCharts,
          },
        },
        data: growingData,
      },
    ],
  };

  chartByType.setOption(optionsByType);
}
