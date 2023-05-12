import { Component, OnInit } from '@angular/core';
import { Reservation } from '../model/reservation.model';
import { ReservationService } from '../services/reservation.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})

export class ReservationComponent implements OnInit {
  reservations: Reservation[] = [];
  reservation: Reservation = new Reservation();
  reservationDatesStr: string = "";
  editingReservation = false;
  constructor(private reservationService: ReservationService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getAllReservations();
  }

  /**
  * Transform a string of dates separated by commas into date array
  * @param dateString Dates separated by commas as string
  * @returns Array of Dates
  */
  transformReservationDates(dateString: string): Date[] {
    const dateStrings = dateString.split(',');
    const dates: Date[] = [];

    dateStrings.forEach(dateStr => {
      const parts = dateStr.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);

      const date = new Date(year, month, day);
      dates.push(date);
    });

    return dates;
  }

  /**
  * Displays a notification message using MatSnackBar.
  * @param message The message to be displayed.
  */
  showNotification(message: string): void {
    const barConfig = new MatSnackBarConfig();
    barConfig.verticalPosition = 'top';
    barConfig.duration = 3000;
    this.snackBar.open(message, 'Close', barConfig);
  }


  /**
  * Get all reservations
  */
  getAllReservations() {
    this.reservationService.getReservations().subscribe(
      {
        next: (reservations) => {
          this.reservations = reservations
        },
        error: (e) => {
          console.error('Error retrieving rreservations', e);
          this.showNotification('Error retrieving rreservations.');
        }
      }
    );

  }

  /**
  * Edit a reservation
  * @param reservation The reservation to be edited.
  */
  editReservation(reservation: Reservation) {
    this.reservation = { ...reservation }; // Create a copy of the reservation for editing
    this.editingReservation = true;
    this.reservationDatesStr = this.reservation.reservationDates.map(date => {
      if (typeof date === 'object' && date instanceof Date) {
        return date.toISOString();
      } else {
        return date;
      }
    }).join(',');
  }


  /**
  * Delete a reservation record based on id
  * @param reservation The reservation to be deleted.
  */
  deleteReservation(reservation: Reservation) {
    this.reservationService.deleteReservation(reservation.id).subscribe(
      {
        complete: () => {
          this.showNotification('Reservation deleted successfully.');
          this.getAllReservations();
        },
        error: (e) => {
          console.error('Error deleting reservation', e);
          this.showNotification('Error deleting reservation. Please try again.');
        }
      }
    );
  }

  /**
  * Create a new reservation record or save an existing record
  */
  saveReservation() {
    if (this.editingReservation) {
      this.reservation.reservationDates = this.transformReservationDates(this.reservationDatesStr);
      this.reservationService.updateReservation(this.reservation).subscribe(
        {
          next: (reservationCreated) => {
            this.showNotification('Reservation updated successfully.')
            this.getAllReservations();
          }, error: (e) => {
            console.error('Error updating reservation', e);
            this.showNotification('Error updating reservation. Please try again.');
          }
        });
    } else {
      this.reservation.reservationDates = this.transformReservationDates(this.reservationDatesStr);
      this.reservationService.createReservation(this.reservation).subscribe(
        {
          next: (reservationCreated) => {
            this.showNotification('Reservation created successfully.')
            this.getAllReservations();
          }, error: (e) => {
            console.error('Error creating reservation', e);
            this.showNotification('Error creating reservation. Please try again.');
          }
        });
    }
    this.cancelEdit();
  }

  /**
  * Reset reservation object and buttons
  */
  cancelEdit() {
    this.reservation = new Reservation();
    this.reservationDatesStr = "";
    this.editingReservation = false;
  }
}
