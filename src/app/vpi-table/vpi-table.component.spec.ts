import { TestBed } from '@angular/core/testing';
import { VpiTableComponent } from './vpi-table.component';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from 'services/auth.service';
import { MessageService } from 'primeng/api';
import { ApiCallsService } from 'services/api-calls.service';
import { DataService } from 'services/data.service';
import { of } from 'rxjs';
import { mockFilteredData, mockFilteredDataError, mockFilteredPayload } from 'app/app.component.mock';
import WaveSurfer from 'wavesurfer.js';

class MockMsalService {
  instance = {
    activeAccount: null,
    getActiveAccount: () => null,
    getAllAccounts: () => [],
    setActiveAccount: () => { '' }
  };
}

describe('VpiTableComponent', () => {
  let component: VpiTableComponent;
  let apiService: jasmine.SpyObj<ApiCallsService>;
  let dataService: jasmine.SpyObj<DataService>;
  let messageService: jasmine.SpyObj<MessageService>;
  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['getFilteredData']);
    dataService = jasmine.createSpyObj('DataService', [
      'loadingTableDataSignal',
      'pagedDataSignal',
      'totalRecordsSignal'
    ], {
      loadingTableDataSignal: { set: jasmine.createSpy('set') },
      pagedDataSignal: { set: jasmine.createSpy('set') },
      totalRecordsSignal: { set: jasmine.createSpy('set') }
    });
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [VpiTableComponent],
      providers: [
        ApiCallsService,
        AuthService,
        { provide: MsalService, useClass: MockMsalService },
        VpiTableComponent,
        { provide: ApiCallsService, useValue: apiService },
        { provide: DataService, useValue: dataService },
        { provide: MessageService, useValue: messageService }
      ]
    });
    const fixture = TestBed.createComponent(VpiTableComponent);
    component = fixture.componentInstance;
  });

  it('should create VPI Table Component', () => {
    expect(component).toBeTruthy();
  });

  it('should get valid response data from this fetchData method is success ', () => {
    spyOn(component.totalRecords, 'set');
    component.totalRecords.set(2);
    apiService.getFilteredData.and.returnValue(of(mockFilteredData));
    component['fetchData'](mockFilteredPayload);
    expect(dataService.loadingTableDataSignal.set).toHaveBeenCalledWith(true);
    expect(dataService.pagedDataSignal.set).toHaveBeenCalledWith(mockFilteredData.data);
    expect(dataService.totalRecordsSignal.set).toHaveBeenCalledWith(2);
    expect(component.totalRecords.set).toHaveBeenCalledWith(2);
    expect(dataService.loadingTableDataSignal.set).toHaveBeenCalledWith(false);
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Data fetched successfully.'
    });
  });



  it('should handle empty response data when getFilteredData method fails', () => {
    apiService.getFilteredData.and.returnValue(of(mockFilteredDataError));

    component['fetchData'](mockFilteredPayload);

    expect(dataService.loadingTableDataSignal.set).toHaveBeenCalledWith(true);
    expect(dataService.pagedDataSignal.set).toHaveBeenCalledWith([]);
    expect(dataService.loadingTableDataSignal.set).toHaveBeenCalledWith(false);
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No data found for the selected dates.'
    });
  });


  it('should download the selected audio file and show success message when audioUrl is present', (done) => {
    component['audioUrl'] = 'http://localhost/audio/test.wav';
    const rowData = [{ fileName: 'test.wav' }] as any;
    const anchorSpy = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
    anchorSpy.href = '';
    anchorSpy.download = '';
    anchorSpy.target = '';

    const realAnchor = document.createElement('a');
    spyOn(realAnchor, 'click');
    spyOn(document, 'createElement').and.returnValue(realAnchor);

    spyOn(document.body, 'appendChild').and.stub();
    spyOn(document.body, 'removeChild').and.stub();

    component.downloadAudio(rowData);

    expect(realAnchor.href).toBe('http://localhost/audio/test.wav');
    expect(realAnchor.download).toBe('test.wav');
    expect(realAnchor.click).toHaveBeenCalled();

    setTimeout(() => {
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio downloaded successfully'
      });
      done();
    }, 3100);
  });

  it('should show error message when audioUrl is missing in the selected row data', () => {
    component['audioUrl'] = null as any;
    const rowData = [{ fileName: 'test.wav' }] as any;

    component.downloadAudio(rowData);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'error',
      detail: 'No audio URL to download'
    });
  });



  it('should create wavesurfer instance and load audio when waveFormRef exists', () => {
    const mockWaveSurfer = jasmine.createSpyObj('WaveSurfer', ['load']);
    spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurfer);

    component.waveFormRef = { nativeElement: document.createElement('div') };
    component.audioUrl = 'http://localhost/audio/test.wav';

    component.Waveform();

    expect(WaveSurfer.create).toHaveBeenCalledWith(jasmine.objectContaining({
      container: component.waveFormRef.nativeElement
    }));
    expect(mockWaveSurfer.load).toHaveBeenCalledWith('http://localhost/audio/test.wav');
  });


  it('should give the error and return if waveFormRef is missing', () => {
    spyOn(console, 'error');

    component['waveFormRef'] = null as any;
    component.Waveform();

    expect(console.error).toHaveBeenCalledWith('Waveform container not found');
    expect(component.Waveform()).toBeUndefined();
  });



  it('should call load with empty string if audioUrl is null', () => {
    const mockElement = document.createElement('div');
    component['waveFormRef'] = { nativeElement: mockElement } as any;
    component['audioUrl'] = null as any;

    const mockWaveSurfer = jasmine.createSpyObj('WaveSurfer', ['load']);
    spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurfer);

    component.Waveform();

    expect(mockWaveSurfer.load).toHaveBeenCalledWith('');
  });
});
