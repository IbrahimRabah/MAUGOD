import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { Employee, EmployeeCreateUpdateRequest, EmployeeResponse } from '../../../core/models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
private apiUrl = `${environment.apiUrl}/Employees`;  ;
   
  constructor(private http:HttpClient) { }
  getEmployees(pagination:PaginationRequest): Observable<EmployeeResponse> {
    const headers  =  new HttpHeaders({
      'lang': pagination.lang
    });

    return this.http.post<EmployeeResponse>(`${this.apiUrl}/GetEmployees`,pagination, { headers });
  }
  getEmployeeById(id: number, lang: number): Observable<Employee> {
     const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString(),
        'empId':id.toString()
      });
    return this.http.get<Employee>(`${this.apiUrl}/GetEditEmployee`, {headers});
  }
  addEmployee(employee: EmployeeCreateUpdateRequest, lang: number): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString()
      });

      // Include employeeId in the request body as required by the API
      const employeeData: EmployeeCreateUpdateRequest = {
        rowId: employee.rowId,
        empId: employee.empId,
        ar: employee.ar,
        en: employee.en,
        activeFlag: employee.activeFlag,
        statusId: employee.statusId,
        fpid: employee.fpid,
        deptId: employee.deptId,
        natId: employee.natId,
        gender: employee.gender,
        email: employee.email,
        smsPhone: employee.smsPhone,
        phone: employee.phone,
        physicalAddress: employee.physicalAddress,
        maritalStatus: employee.maritalStatus,
        birthDate: employee.birthDate,
        hireSDate: employee.hireSDate,
        hireEDate: employee.hireEDate,
        jobId: employee.jobId,
        jobTypId: employee.jobTypId,
        empVatInfo: employee.empVatInfo,
        govId: employee.govId,
        govIdExpiration: employee.govIdExpiration,
        employeeCardNo: employee.employeeCardNo,
        employeeCardExpiration: employee.employeeCardExpiration,
        driverLicenceNo: employee.driverLicenceNo,
        driverLicenceExpiration: employee.driverLicenceExpiration,
        healthCardNo: employee.healthCardNo,
        healthCardExpiration: employee.healthCardExpiration,
        insuranceCardInfo: employee.insuranceCardInfo,
        insuranceCardExpiration: employee.insuranceCardExpiration,
        passportNo: employee.passportNo,
        passportExpiration: employee.passportExpiration,
        userName: employee.userName,
        passwd: employee.passwd,
        lang: employee.lang,
        note: employee.note
      };
    return this.http.post<Employee>(`${this.apiUrl}/CreateEmployee`, employeeData,{headers});
  }
  updateEmployee(id: number, employee: EmployeeCreateUpdateRequest, lang: number): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString(),
        'employeeId': id.toString() // Include employeeId in the headers if required by the API
      });
      
      // Include employeeId in the request body as required by the API
      const employeeData: EmployeeCreateUpdateRequest = {
        rowId: employee.rowId,
        empId: employee.empId,
        ar: employee.ar,
        en: employee.en,
        activeFlag: employee.activeFlag,
        statusId: employee.statusId,
        fpid: employee.fpid,
        deptId: employee.deptId,
        natId: employee.natId,
        gender: employee.gender,
        email: employee.email,
        smsPhone: employee.smsPhone,
        phone: employee.phone,
        physicalAddress: employee.physicalAddress,
        maritalStatus: employee.maritalStatus,
        birthDate: employee.birthDate,
        hireSDate: employee.hireSDate,
        hireEDate: employee.hireEDate,
        jobId: employee.jobId,
        jobTypId: employee.jobTypId,
        empVatInfo: employee.empVatInfo,
        govId: employee.govId,
        govIdExpiration: employee.govIdExpiration,
        employeeCardNo: employee.employeeCardNo,
        employeeCardExpiration: employee.employeeCardExpiration,
        driverLicenceNo: employee.driverLicenceNo,
        driverLicenceExpiration: employee.driverLicenceExpiration,
        healthCardNo: employee.healthCardNo,
        healthCardExpiration: employee.healthCardExpiration,
        insuranceCardInfo: employee.insuranceCardInfo,
        insuranceCardExpiration: employee.insuranceCardExpiration,
        passportNo: employee.passportNo,
        passportExpiration: employee.passportExpiration,
        userName: employee.userName,
        passwd: employee.passwd,
        lang: employee.lang,
        note: employee.note
      };
    return this.http.post<Employee>(`${this.apiUrl}/UpdateEmployee`, employeeData,{headers});
  }
  // deleteEmployee(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/DeleteEmployee/${id}`);
  // }

  changeEmployeeId(oldEmployeeId: number, newEmployeeId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    
    const requestBody = {
      tableName: "EMP_MASTER",
      oldEmpId: oldEmployeeId,
      newEmpId: newEmployeeId,
      
    };

    return this.http.post<any>(`${this.apiUrl}/UpdateEmpPrimaryKey`, requestBody, { headers });
  }

  resetEmpPassword(empId: number, lang: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'lang': lang.toString(),
    'empId':empId.toString()
  });

  return this.http.get<any>(
    `${this.apiUrl}/ResetEmpPassword`,
    { headers }
  );
}

resetEmpsPassword(empIds: number[], lang: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'lang': lang.toString()
  });

  return this.http.post<any>(
    `${this.apiUrl}/ResetEmpsPassword`,
    { empIds },
    { headers }
  );
}
}
