#include <iostream>
using namespace std;

int main() {
    int size;
    cout << "Enter size: ";
    cin >> size;
    
    int arr[size];
    cout << "Enter elements: ";
    for (int i = 0; i < size; i++) cin >> arr[i];
    
    for (int i = 0; i < size / 2; i++) {
        swap(arr[i], arr[size - i - 1]);
    }
    
    cout << "Reversed array: ";
    for (int i = 0; i < size; i++) cout << arr[i] << " ";
    
    return 0;
}

