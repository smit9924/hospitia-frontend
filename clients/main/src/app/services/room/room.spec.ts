import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiRoutes } from '../../data/api-routes';
import { RoomStatus } from '../../types/enums/room';
import { Room } from './room';

describe('Room', () => {
  let service: Room;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Room);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends the GUID as a query parameter for detail and delete', () => {
    service.getRoom('room-1').subscribe();
    service.delete('room-1').subscribe();

    expect(httpTesting.expectOne(`${apiRoutes.room.get}?guid=room-1`).request.method).toBe('GET');
    expect(httpTesting.expectOne(`${apiRoutes.room.delete}?guid=room-1`).request.method).toBe(
      'DELETE',
    );
  });

  it('lists rooms with search, sorting and pagination', () => {
    service
      .list({
        searchTerm: '10',
        pageSize: 10,
        sortBy: 'floor',
        sortDirection: 'desc',
        pageNumber: 2,
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === apiRoutes.room.list);
    expect(request.request.params.get('searchTerm')).toBe('10');
    expect(request.request.params.get('sortBy')).toBe('floor');
    expect(request.request.params.get('pageNumber')).toBe('2');
    request.flush({ items: [], totalCount: 0, pageNumber: 2, pageSize: 10 });
  });

  it('creates with POST and updates with PUT', () => {
    const attributes = {
      roomNumber: '101',
      floor: 1,
      roomTypeGuid: 'type-1',
      status: RoomStatus.AVAILABLE,
      notes: null,
    };
    service.create({ organizationGuid: null, ...attributes }).subscribe();
    service.update({ guid: 'room-1', ...attributes }).subscribe();

    expect(httpTesting.expectOne(apiRoutes.room.create).request.method).toBe('POST');
    expect(httpTesting.expectOne(apiRoutes.room.update).request.method).toBe('PUT');
  });
});
