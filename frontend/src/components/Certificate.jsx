import React from "react";

const Certificate = ({
    studentName,
    domainName,
    score,
    level,
    date,
    certificateRef
}) => {
    return (
        <div className="w-full overflow-hidden mt-8 rounded-xl shadow-inner flex justify-center py-8" style={{ backgroundColor: "#f9fafb" }}>
            <div
                ref={certificateRef}
                className="w-[800px] h-[600px] shrink-0 relative p-10 flex flex-col items-center justify-center border-8 border-double shadow-2xl overflow-hidden box-border"
                style={{
                    minWidth: "800px",
                    minHeight: "600px",
                    borderColor: "#1e3a8a",
                    backgroundColor: "#ffffff",
                    background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
                }}
            >
                {/* Decorative corner elements */}
                <div className="absolute top-4 left-4 w-32 h-32 border-t-8 border-l-8 rounded-tl-3xl opacity-20" style={{ borderColor: "#2563eb" }}></div>
                <div className="absolute bottom-4 right-4 w-32 h-32 border-b-8 border-r-8 rounded-br-3xl opacity-20" style={{ borderColor: "#2563eb" }}></div>

                {/* Header */}
                <div className="text-center mb-8 relative z-10 w-full flex flex-col items-center" style={{ color: "#1e3a8a" }}>
                    <h1 className="text-4xl font-extrabold uppercase mb-4 w-full text-center" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "1px", textRendering: "geometricPrecision" }}>
                        CERTIFICATE OF ACHIEVEMENT
                    </h1>
                    <div className="h-1 w-64 mt-2" style={{ backgroundColor: "#eab308" }}></div>
                </div>

                {/* Presentation Text */}
                <p className="text-lg mb-4 italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#4b5563", letterSpacing: "1px", textRendering: "geometricPrecision" }}>
                    This is proudly presented to
                </p>

                {/* Student Name */}
                <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1e3a8a", letterSpacing: "1px", textRendering: "geometricPrecision" }}>
                    {studentName || "Student Name"}
                </h2>

                {/* Description */}
                <p className="text-xl mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#4b5563", letterSpacing: "0.5px", textRendering: "geometricPrecision" }}>
                    For successfully completing the Assessment in
                </p>
                <h3 className="text-3xl font-bold mb-8 uppercase" style={{ color: "#1d4ed8", letterSpacing: "1.5px", textRendering: "geometricPrecision" }}>
                    {domainName || "Domain Name"}
                </h3>

                {/* Score & Level Matrix */}
                <div className="flex gap-16 justify-center mb-10 w-full px-12" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", textRendering: "geometricPrecision" }}>
                    <div className="text-center grow basis-0">
                        <p className="text-sm uppercase font-bold" style={{ color: "#6b7280", letterSpacing: "1px" }}>Score</p>
                        <p className="text-2xl font-bold" style={{ color: "#1f2937" }}>{score}%</p>
                    </div>
                    <div className="text-center grow basis-0">
                        <p className="text-sm uppercase font-bold" style={{ color: "#6b7280", letterSpacing: "1px" }}>Level</p>
                        <p className="text-2xl font-bold" style={{ color: "#2563eb" }}>{level || "Level"}</p>
                    </div>
                    <div className="text-center grow basis-0">
                        <p className="text-sm uppercase font-bold" style={{ color: "#6b7280", letterSpacing: "1px" }}>Date</p>
                        <p className="text-lg font-bold whitespace-nowrap" style={{ color: "#1f2937" }}>{date || new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Footer/Signatures */}
                <div className="flex justify-between items-end w-full px-16 mt-4 opacity-80 relative z-10" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "1px", textRendering: "geometricPrecision" }}>
                    <div className="text-center">
                        <div className="w-40 border-b-2 mb-2" style={{ borderColor: "#9ca3af" }}></div>
                        <p className="text-sm uppercase font-bold" style={{ color: "#4b5563" }}>Skill Verification</p>
                    </div>

                    <div className="flex items-center justify-center mt-2 mx-auto">
                        <span className="text-6xl" style={{ color: "#eab308", lineHeight: 1 }}>🏆</span>
                    </div>

                    <div className="text-center">
                        <div className="mb-2">
                            <p className="text-2xl signature-font inline-block mt-2" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive", color: "#1e3a8a" }}>Shanmuga Vijay</p>
                        </div>
                        <div className="w-40 border-b-2 mb-2" style={{ borderColor: "#9ca3af" }}></div>
                        <p className="text-sm uppercase font-bold" style={{ color: "#4b5563" }}>System Director</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
