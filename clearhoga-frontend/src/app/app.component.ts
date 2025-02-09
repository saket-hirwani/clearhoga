import { Component, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule } from '@angular/forms'; // For form control
import { CommonModule, NgIf } from '@angular/common';  // Structural directive for *ngIf
@Component({
  selector: 'app-root',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  examName = "";
  difficultyLevel = "easy";
  language = "english";
  manualLanguage ="";
  heading= "";
  headDescription= "";
  questions:Array<{answer:string,explanation:string,options:Array<string>,question:string,selectedAnswer:string}> =[];         // Signal for storing fetched questions
  loading = signal(false);        // Signal for loading state
  error= "";            

  constructor(private http: HttpClient) {}

  // Method to fetch questions based on the exam name
  getQuestions(): void {
    if (!this.examName) return;  // Validate if exam name is entered
    this.error = "";
    this.loading.set(true);  // Set loading to true
    this.http.post<any>('http://localhost:3000/api/generate-questions', { examName: this.examName,
      language : this.language =='manual' ? this.manualLanguage : this.language,
      difficultyLevel: this.difficultyLevel
})
      .subscribe(
        (data) => {
          if(data && this.questions?.length < 50){
          this.questions = [...this.questions,...data.questions]; // Set the fetched questions
          this.heading = data.heading?.heading;
          this.headDescription = data.heading?.desc;       
          }else{
            this.error = "No questions found for the given exam name";  // Set error in case of no questions
            this.questions = [];  // Reset questions in case of no questions
          }
          this.loading.set(false);  // Set loading to false
        },
        (error) => {
          console.error('Error fetching questions', error);
          this.error = error.error;  // Set error in case of error
          this.loading.set(false);  // Set loading to false in case of error
        }
      );
  }
  selectAnswer(question: { selectedAnswer: any; }, answer: any): void {
    question.selectedAnswer = answer;
  }
  onLanguageChange(event: any): void {
    this.language = event.target.value;
  }
}
