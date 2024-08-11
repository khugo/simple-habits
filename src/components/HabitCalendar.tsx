import * as d3 from "d3";

export function HabitCalendar(
  data,
  {
    x = ([x]) => x,
    y = ([, y]) => y,
    title,
    width = 928,
    cellSize = 17,
    weekday = "monday",
    formatDay = (i) => "SMTWTFS"[i],
    formatMonth = "%b",
    yFormat,
    activeColor = "#838CF1",
    inactiveColor = "#eaeaea",
    highlightDate = null,
    highlightColor = "#A8B4F6",
    highlightWidth = 2,
  } = {},
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);

  const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;
  const timeWeek = weekday === "sunday" ? d3.timeWeek : d3.timeMonday;
  const weekDays = weekday === "weekday" ? 5 : 7;
  const height = cellSize * (weekDays + 2);

  // Construct formats.
  formatMonth = d3.timeFormat(formatMonth);

  // Compute titles.
  if (title === undefined) {
    const formatDate = d3.timeFormat("%B %-d, %Y");
    const formatValue = d3.format(yFormat || ",");
    title = (i) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
  } else if (title !== null) {
    const T = d3.map(data, title);
    title = (i) => T[i];
  }

  // Group the index by year, in reverse input order.
  const years = d3.groups(I, (i) => X[i].getFullYear()).reverse();

  function pathMonth(t) {
    const d = Math.max(0, Math.min(weekDays, countDay(t.getDay())));
    const w = timeWeek.count(d3.timeYear(t), t);
    return `${
      d === 0
        ? `M${w * cellSize},0`
        : d === weekDays
          ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`
    }V${weekDays * cellSize}`;
  }

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height * years.length)
    .attr("viewBox", [0, 0, width, height * years.length])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

  const year = svg
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`,
    );

  year
    .append("text")
    .attr("x", -5)
    .attr("y", -5)
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(([key]) => key);

  year
    .append("g")
    .attr("text-anchor", "end")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")
    .attr("x", -5)
    .attr("y", (i) => (countDay(i) + 0.5) * cellSize)
    .attr("dy", "0.31em")
    .text(formatDay);

  const cell = year
    .append("g")
    .selectAll("rect")
    .data(
      weekday === "weekday"
        ? ([, I]) => I.filter((i) => ![0, 6].includes(X[i].getDay()))
        : ([, I]) => I,
    )
    .join("rect")
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr("x", (i) => timeWeek.count(d3.timeYear(X[i]), X[i]) * cellSize + 0.5)
    .attr("y", (i) => countDay(X[i].getDay()) * cellSize + 0.5)
    .attr("fill", (i) => (Y[i] === 0 ? inactiveColor : activeColor))
    .attr("stroke", (i) => {
      if (highlightDate) {
        const cellDate = X[i];
        return cellDate.toDateString() === highlightDate.toDateString()
          ? highlightColor
          : "none";
      }
      return "none";
    })
    .attr("stroke-width", highlightWidth)
    .attr("shape-rendering", "crispEdges");

  // Adjust the size of highlighted cells to accommodate the inner stroke
  cell
    .filter((i) => {
      if (highlightDate) {
        const cellDate = X[i];
        return cellDate.toDateString() === highlightDate.toDateString();
      }
      return false;
    })
    .attr("width", cellSize - 1 - highlightWidth)
    .attr("height", cellSize - 1 - highlightWidth)
    .attr(
      "x",
      (i) =>
        timeWeek.count(d3.timeYear(X[i]), X[i]) * cellSize +
        0.5 +
        highlightWidth / 2,
    )
    .attr(
      "y",
      (i) => countDay(X[i].getDay()) * cellSize + 0.5 + highlightWidth / 2,
    );

  if (title) cell.append("title").text(title);

  const month = year
    .append("g")
    .selectAll("g")
    .data(([, I]) => d3.timeMonths(d3.timeMonth(X[I[0]]), X[I[I.length - 1]]))
    .join("g");

  month
    .filter((d, i) => i)
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("d", pathMonth);

  month
    .append("text")
    .attr(
      "x",
      (d) => timeWeek.count(d3.timeYear(d), timeWeek.ceil(d)) * cellSize + 2,
    )
    .attr("y", -5)
    .text(formatMonth);

  return svg.node();
}
