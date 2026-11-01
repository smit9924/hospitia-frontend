import { FloorLabelPipe } from './floor-label-pipe';

describe('FloorLabelPipe', () => {
  const pipe = new FloorLabelPipe();

  it.each([
    [0, 'Ground'],
    [-1, 'B1'],
    [-5, 'B5'],
    [-500, 'B500'],
    [1, '1'],
    [500, '500'],
  ])('shows floor %s as "%s"', (floor, label) => {
    expect(pipe.transform(floor)).toBe(label);
  });

  it.each([
    [0, 'ground floor'],
    [-5, 'basement 5'],
    [3, 'floor 3'],
  ])('describes floor %s as "%s"', (floor, description) => {
    expect(pipe.transform(floor, 'description')).toBe(description);
  });

  it.each([null, undefined, 1.5])('renders %s as an empty label', (floor) => {
    expect(pipe.transform(floor)).toBe('');
  });
});
