#include <iostream>
using namespace std;

// Fungsi gotoxy versi khusus Mac (macOS)
void gotoxy(int x, int y) {
    cout << "\033[" << y << ";" << x << "H" << flush;
}

int main() {
    system("clear");
    
    char nama[20];
    char bagian[20];
    int anak;
    int tunjangan;

    int brs = 4, klm = 18, klmi = 36;

    gotoxy(klm, brs++); cout << "Hitung Tunjangan Anak";
    gotoxy(klm, brs++); cout << "---------------------";
    gotoxy(klm, brs++); cout << "1. Nama       : ";
    gotoxy(klm, brs++); cout << "2. Bagian     : ";
    gotoxy(klm, brs++); cout << "3. Jml Anak   : ";
    gotoxy(klm, brs++); cout << "   Tunjangan  : ";

    brs = 6;
    gotoxy(klmi, brs++); cin.getline(nama, 20);
    gotoxy(klmi, brs++); cin >> bagian;
    gotoxy(klmi, brs++); cin >> anak;

    if (anak > 3) {
        tunjangan = 3 * 100000;
    } else {
        tunjangan = anak * 100000;
    }

    gotoxy(klmi, 9); cout << tunjangan;

    cout << "\n\n";
    return 0;
}