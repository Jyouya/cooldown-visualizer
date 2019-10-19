export default function graphIntersecitons(graph1, graph2) {
  console.log('graph1: ', graph1, 'graph2: ', graph2);
  const segments1 = getSegments(graph1);
  const segments2 = getSegments(graph2);
  return segments1.flatMap(s1 =>
    segments2.flatMap(s2 => intersects(...s1, ...s2))
  );
}

function getSegments(graph) {
  return graph
    .slice(0, -1)
    .map((left, i) => [left[0], left[1], graph[i + 1][0], graph[i + 1][1]]);
}

//* https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function intersects(a, b, c, d, p, q, r, s) {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    // check cross product of abcd's direction vector with (pqrs's position vector - abcd's position vector)
    if ((p - a) * (d - b) - (q - b) * (c - a)) {
      return [];
    } else {
      if ((a <= p && p <= c) || (a <= r && r <= c)) {
        const sorted = [a, c, p, r].sort();
        //
        const left = sorted[1];
        const right = sorted[2];
        if (left === right) {
          return [left];
        } else {
          return [left, right];
        }
      }
      return [];
    }
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    if (0 < lambda && lambda < 1 && (0 < gamma && gamma < 1)) {
      return [a + lambda * (c - a)];
    } else {
      return [];
    }
  }
}
