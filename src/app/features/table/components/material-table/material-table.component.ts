import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CrudDialogComponent } from '../../dialogs/crud-dialog/crud-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { DataService, } from '../../../../core/services/data.service';
export interface Post {
  userId?: number;
  id?: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-material-table',
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatButtonModule
  ],
})
export class MaterialTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'body', 'actions'];
  dataSource = new MatTableDataSource<Post>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private apiUrl = 'https://jsonplaceholder.typicode.com/posts'; // API Base URL

  constructor(private dataService: DataService, private dialog: MatDialog) {}

  ngOnInit() {
    // Fetch posts from the API
    this.dataService.getPosts().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addPost() {
    const dialogRef = this.dialog.open(CrudDialogComponent, {
      width: '500px',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataService.createPost(result).subscribe((newPost) => {
          this.dataSource.data = [...this.dataSource.data, newPost];
        });
      }
    });
  }

  editPost(post: Post) {
    const dialogRef = this.dialog.open(CrudDialogComponent, {
      width: '500px',
      data: { mode: 'edit', post },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedPost = { ...post, ...result };
        this.dataService.createPost(result).subscribe((newPost) => {
          const index = this.dataSource.data.findIndex((p) => p.id === post.id);
          this.dataSource.data[index] = updatedPost;
          this.dataSource._updateChangeSubscription(); 
        });
      }
    });
  }

  deletePost(post: Post) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataService.deletePost(post.id!).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((p) => p.id !== post.id);
        });
      }
    });
  }
}
