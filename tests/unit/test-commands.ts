import { expect, describe, test, jest, beforeEach } from '@jest/globals';

const mockShowDialog = jest.fn().mockResolvedValue(undefined);
jest.mock('@jupyterlab/apputils', () => ({
  showDialog: mockShowDialog,
  Dialog: { okButton: () => ({}) },
}));

const mockFetchFileData = jest.fn();
jest.mock('../../lib/services/data-service', () => ({
  DataService: jest.fn().mockImplementation(() => ({
    fetchFileData: mockFetchFileData,
  })),
}));

function makeFactory(item: { done: boolean; value?: { path: string } }) {
  return {
    tracker: {
      currentWidget: {
        selectedItems: () => ({ next: () => item }),
      },
    },
  };
}

describe('openFileViewer', () => {
  let openFileViewer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ openFileViewer } = require('../../lib/commands'));
  });

  test('returns early when no browser is available', async () => {
    const factory = { tracker: { currentWidget: null } };
    await openFileViewer({}, factory);
    expect(mockFetchFileData).not.toHaveBeenCalled();
  });

  test('returns early when no file is selected', async () => {
    const factory = makeFactory({ done: true });
    await openFileViewer({}, factory);
    expect(mockFetchFileData).not.toHaveBeenCalled();
  });

  test('fetches file data for the selected path', async () => {
    mockFetchFileData.mockResolvedValueOnce({
      data: [{ col: 'val' }],
      columns: ['col'],
      total_rows: 1,
    });
    const factory = makeFactory({ done: false, value: { path: '/notebooks/data.csv' } });

    await openFileViewer({}, factory);

    expect(mockFetchFileData).toHaveBeenCalledWith('/notebooks/data.csv');
    expect(mockShowDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Data Viewer' })
    );
  });

  test('shows error dialog when fetch fails', async () => {
    mockFetchFileData.mockRejectedValueOnce(new Error('Network error'));
    const factory = makeFactory({ done: false, value: { path: '/notebooks/data.csv' } });

    await openFileViewer({}, factory);

    expect(mockShowDialog).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Error' })
    );
  });
});
