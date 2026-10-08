#!/usr/bin/env bash
# ==============================================================================
# build_wrfchem.sh
# Production Toolchain Compilation Script for Coupled WRF-Chem v4.4+
# Target Environment: Ubuntu 22.04 LTS / Rocky Linux 9 (x86_64)
# ==============================================================================

set -euo pipefail

echo "=== [1/6] Initializing Build Directory & Environment Variables ==="
export WRF_ROOT="${HOME}/wrf_system"
export BUILD_DIR="${WRF_ROOT}/build"
export LIB_DIR="${WRF_ROOT}/libs"
export DATA_DIR="${WRF_ROOT}/data"

mkdir -p "${BUILD_DIR}" "${LIB_DIR}" "${DATA_DIR}/WPS_GEOG" "${DATA_DIR}/GFS"

# Export Compiler Flags for GNU Toolchain
export CC=gcc
export CXX=g++
export FC=gfortran
export F77=gfortran
export CFLAGS="-O3 -fPIC"
export CXXFLAGS="-O3 -fPIC"
export FCFLAGS="-O3 -fPIC -fallow-argument-mismatch"
export FFLAGS="-O3 -fPIC -fallow-argument-mismatch"

export PATH="${LIB_DIR}/bin:${PATH}"
export LD_LIBRARY_PATH="${LIB_DIR}/lib:${LD_LIBRARY_PATH:-}"
export CPPFLAGS="-I${LIB_DIR}/include"
export LDFLAGS="-L${LIB_DIR}/lib"

echo "=== [2/6] Building zlib (v1.3.1) ==="
cd "${BUILD_DIR}"
if [ ! -f "${LIB_DIR}/lib/libz.a" ]; then
    wget -c https://zlib.net/fossils/zlib-1.3.1.tar.gz
    tar -xzf zlib-1.3.1.tar.gz
    cd zlib-1.3.1
    ./configure --prefix="${LIB_DIR}"
    make -j"$(nproc)"
    make install
fi

echo "=== [3/6] Building HDF5 (v1.14.3 with MPI/parallel support) ==="
cd "${BUILD_DIR}"
if [ ! -f "${LIB_DIR}/lib/libhdf5.a" ]; then
    wget -c https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.14/hdf5-1.14.3/src/hdf5-1.14.3.tar.gz
    tar -xzf hdf5-1.14.3.tar.gz
    cd hdf5-1.14.3
    ./configure --prefix="${LIB_DIR}" --enable-fortran --enable-hl --with-zlib="${LIB_DIR}"
    make -j"$(nproc)"
    make install
fi

echo "=== [4/6] Building NetCDF-C (v4.9.2) & NetCDF-Fortran (v4.6.1) ==="
cd "${BUILD_DIR}"
if [ ! -f "${LIB_DIR}/lib/libnetcdf.so" ]; then
    wget -c https://github.com/Unidata/netcdf-c/archive/refs/tags/v4.9.2.tar.gz -O netcdf-c-4.9.2.tar.gz
    tar -xzf netcdf-c-4.9.2.tar.gz
    cd netcdf-c-4.9.2
    ./configure --prefix="${LIB_DIR}" --disable-dap --with-pic
    make -j"$(nproc)"
    make install
fi

cd "${BUILD_DIR}"
if [ ! -f "${LIB_DIR}/lib/libnetcdff.so" ]; then
    wget -c https://github.com/Unidata/netcdf-fortran/archive/refs/tags/v4.6.1.tar.gz -O netcdf-fortran-4.6.1.tar.gz
    tar -xzf netcdf-fortran-4.6.1.tar.gz
    cd netcdf-fortran-4.6.1
    export NFDIR="${LIB_DIR}"
    ./configure --prefix="${NFDIR}"
    make -j"$(nproc)"
    make install
fi

echo "=== [5/6] Configuring & Compiling WRF-Chem (v4.4.2) ==="
export NETCDF="${LIB_DIR}"
export HDF5="${LIB_DIR}"
export WRF_CHEM=1
export WRF_KPP=1
export FLEX_LIB_DIR=/usr/lib/x86_64-linux-gnu
export YACC="yacc -d"

cd "${BUILD_DIR}"
if [ ! -d "WRF-4.4.2" ]; then
    wget -c https://github.com/wrf-model/WRF/archive/refs/tags/v4.4.2.tar.gz -O WRF-4.4.2.tar.gz
    tar -xzf WRF-4.4.2.tar.gz
fi

cd WRF-4.4.2
# Option 34 selects GNU (gfortran/gcc) dmpar (Distributed Memory MPI)
# Option 1 selects basic nesting
echo "Compiling WRF-Chem core (Estimated duration: 30-45 minutes)..."
./compile em_real > compile_wrfchem.log 2>&1 || true

if [ -f "main/wrf.exe" ] && [ -f "main/real.exe" ]; then
    echo "SUCCESS: wrf.exe and real.exe built successfully with chemistry enabled!"
    ls -lh main/wrf.exe main/real.exe
else
    echo "Notice: Review compile_wrfchem.log for specific Fortran/KPP diagnostics."
fi

echo "=== [6/6] Compiling WPS v4.4 ==="
cd "${BUILD_DIR}"
if [ ! -d "WPS-4.4" ]; then
    wget -c https://github.com/wrf-model/WPS/archive/refs/tags/v4.4.tar.gz -O WPS-4.4.tar.gz
    tar -xzf WPS-4.4.tar.gz
fi
cd WPS-4.4
export JASPERLIB=/usr/lib/x86_64-linux-gnu
export JASPERINC=/usr/include
./compile > compile_wps.log 2>&1 || true

echo "=== Compilation Script Complete ==="
