import cv2
from ultralytics import YOLO

model = YOLO('best.pt')

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open video stream.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame.")
        break

    results = model(frame, conf=0.25)

    result = results[0]
    annotated_frame = result.plot()

    cv2.imshow('YOLOv8 Detection', annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()